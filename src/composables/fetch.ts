import type { FetchOptions, FetchResponse, ResponseType } from 'ofetch'
import type { ServiceType } from '~/types/global.types'
import { isFormData } from '@lincy/utils'
import { ofetch } from 'ofetch'
import qs from 'qs'
import { baseUrl, isSSR } from '~/config'
import { checkNeedLogin } from '~/utils'
import emitter from './emitter'
import { clearLoginData, tokenStorage, userIdStorage } from './storage'

/** 请求默认超时（毫秒） */
const DEFAULT_TIMEOUT_MS = 10000

/** 与业务成功对齐的 HTTP 状态字段 */
const HTTP_CODE_OK = 200

/** 业务成功状态码 */
const STATUS_SUCCESS = '000000'

/** Token 过期等业务码，需跳转登录 */
const TOKEN_EXPIRED_CODES = ['200002', '200003'] as const

/** 不走 JSON 业务码解析的响应类型（由调用方自行消费 body） */
const RAW_RESPONSE_TYPES = new Set(['stream', 'blob', 'arrayBuffer'])

const pendingRequest = new Map<string, AbortController>()

type MaybeArray<T> = T | T[]

/**
 * 依次执行 ofetch 的 MaybeArray 钩子（支持数组形式的多重监听）
 */
async function invokeFetchHooks<T>(
    hooks: MaybeArray<(ctx: T) => void | Promise<void>> | undefined,
    ctx: T,
): Promise<void> {
    if (hooks == null)
        return
    const list = Array.isArray(hooks) ? hooks : [hooks]
    for (const fn of list)
        await fn(ctx)
}

/** 支持任意 responseType 的 ofetch 实例调用签名（避免 json 与 stream 泛型冲突） */
type Flexible$Fetch = (url: string, options?: FetchOptions<ResponseType>) => Promise<unknown>

/**
 * 读取当前登录态中的 userId、token，供请求体携带
 */
export function getToken() {
    const userId = userIdStorage.value
    const token = tokenStorage.value
    return {
        userId,
        token,
    }
}

/**
 * 将鉴权字段并入普通对象或 FormData
 */
function mergeAuthIntoPayload(
    data: Objable | FormData | undefined,
    token: ReturnType<typeof getToken>,
): Objable | FormData {
    if (data instanceof FormData) {
        data.append('userId', token.userId)
        data.append('token', token.token)
        return data
    }
    return {
        ...(data && typeof data === 'object' ? data : {}),
        ...token,
    }
}

interface IRequestKeyInput {
    url: string
    method?: string
    data?: unknown
}

/**
 * 根据 url、method、data 生成用于取消请求的唯一 key（含时间戳避免并发冲突）
 */
function generateRequestKey(config: IRequestKeyInput): string {
    const { url, method, data } = config
    let serialized: string
    if (typeof data === 'object' && data !== null && !(data instanceof FormData))
        serialized = qs.stringify(data as Objable)
    else
        serialized = String(data ?? '')
    return [url, method ?? 'get', serialized, Date.now()].join('&')
}

/**
 * 归一化 JSON 业务响应：兼容 data/result 字段与 JSON 字符串 result
 */
function normalizeBusinessPayload(payload: Objable): void {
    try {
        if (payload.data != null && payload.result == null) {
            payload.result = payload.data
            payload.data = undefined
        }
        if (typeof payload.result === 'string') {
            payload.result = JSON.parse(payload.result)
        }
        if (payload.statusCode === STATUS_SUCCESS)
            payload.code = HTTP_CODE_OK
    }
    catch (error) {
        console.error('[fetch] normalizeBusinessPayload', error)
    }
}

/**
 * 处理 JSON 形态的业务响应（状态码、登录过期、错误提示）
 * @returns 供 ofetch 链式返回的 `_data`
 */
function handleJsonBusinessResponse(
    url: string,
    response: FetchResponse<Objable>,
    disabledProgress: boolean | undefined,
): Objable {
    const payload = response._data
    if (!payload || typeof payload !== 'object')
        return payload as unknown as Objable

    if (TOKEN_EXPIRED_CODES.includes(payload.statusCode as (typeof TOKEN_EXPIRED_CODES)[number])) {
        if (!checkNeedLogin()) {
            clearLoginData()
            emitter.emit('need-login')
            if (!disabledProgress)
                emitter.emit('nprogress-done', 'api')
            return payload
        }
    }

    if (payload.statusCode !== STATUS_SUCCESS) {
        if (!isSSR) {
            emitter.emit(
                'api-error',
                (payload.message as string) || (payload.error as string) || '请求失败',
            )
        }
        if (!disabledProgress)
            emitter.emit('nprogress-done', 'api')
        return payload
    }

    normalizeBusinessPayload(payload)
    if (import.meta.env.DEV && !disabledProgress)
        console.log(`%c[fetch: ${url}] >> `, 'color: red', payload.result)

    if (!disabledProgress)
        emitter.emit('nprogress-done', 'api')
    return payload
}

/**
 * ofetch 请求封装：统一鉴权、进度条、业务码与可取消请求
 */
export const useApi: (needSignal?: boolean) => FetchApiType = (needSignal = false) => {
    const apiFetch = ofetch.create({
        baseURL: baseUrl,
        headers: {},
    }) as Flexible$Fetch

    return {
        abortKey: '',

        /** @deprecated 拼写错误，请使用 getAbortKey */
        getAbourtKey() {
            return this.abortKey
        },

        getAbortKey() {
            return this.abortKey
        },

        generateRequestKey(config: ServiceType) {
            return generateRequestKey({
                url: config.url,
                method: config.method,
                data: config.data,
            })
        },

        abortRequest(abortKey?: string) {
            const key = abortKey || this.abortKey
            if (!key || !pendingRequest.has(key))
                return
            const controller = pendingRequest.get(key)
            controller?.abort('取消请求')
            pendingRequest.delete(key)
        },

        post(url, data, options) {
            return this.RESTful(url, 'post', data, options)
        },
        get(url, data, options) {
            return this.RESTful(url, 'get', data, options)
        },
        put(url, data, options) {
            return this.RESTful(url, 'put', data, options)
        },
        delete(url, data, options) {
            return this.RESTful(url, 'delete', data, options)
        },

        RESTful(url, method = 'get', data, options) {
            return this.fetch(url, method, data, options)
        },

        async fetch(url, method = 'get', data, options) {
            const {
                disabledProgress,
                onRequest: userOnRequest,
                onRequestError: userOnRequestError,
                onResponse: userOnResponse,
                onResponseError: userOnResponseError,
                ...ofetchRest
            } = options ?? {}

            const responseType = (ofetchRest as { responseType?: string }).responseType
            const isRawBody = responseType != null && RAW_RESPONSE_TYPES.has(responseType)

            let requestAbortKey: string | undefined
            let signal: AbortSignal | undefined

            if (needSignal) {
                requestAbortKey = generateRequestKey({ url, method, data })
                this.abortKey = requestAbortKey
                const controller = new AbortController()
                signal = controller.signal
                pendingRequest.set(requestAbortKey, controller)
            }

            const clearPending = () => {
                if (requestAbortKey && pendingRequest.has(requestAbortKey))
                    pendingRequest.delete(requestAbortKey)
            }

            const token = getToken()
            const payload = mergeAuthIntoPayload(data, token)

            try {
                return await apiFetch(url, {
                    method,
                    query: method === 'get' ? (payload as Objable) : undefined,
                    body: method === 'get' ? undefined : payload,
                    timeout: DEFAULT_TIMEOUT_MS,
                    signal,
                    ...ofetchRest,
                    async onRequest(ctx) {
                        await invokeFetchHooks(userOnRequest, ctx)
                        if (!disabledProgress)
                            emitter.emit('nprogress-start', 'api')
                    },
                    async onRequestError(ctx) {
                        await invokeFetchHooks(userOnRequestError, ctx)
                        if (!isSSR && ctx.error) {
                            emitter.emit('api-error', 'Sorry, The Data Request Failed')
                        }
                        console.error('[fetch request error]', ctx.error)
                    },
                    async onResponse(ctx) {
                        await invokeFetchHooks(userOnResponse, ctx)
                        if (isRawBody) {
                            if (!disabledProgress)
                                emitter.emit('nprogress-done', 'api')
                            return
                        }
                        if (!ctx.response)
                            return
                        return handleJsonBusinessResponse(url, ctx.response, disabledProgress)
                    },
                    async onResponseError(ctx) {
                        await invokeFetchHooks(userOnResponseError, ctx)
                        console.error('[fetch response error]', ctx.response?.status)
                        if (!disabledProgress)
                            emitter.emit('nprogress-done', 'api')
                    },
                    headers: {
                        ...(isFormData(payload) ? {} : { 'Content-Type': 'application/json' }),
                        ...(ofetchRest.headers as Objable | undefined),
                    },
                } as FetchOptions<ResponseType>)
            }
            finally {
                clearPending()
            }
        },
    }
}

if (typeof window !== 'undefined')
    window.$$fetch = useApi(true)

export const $api = useApi()
export const $fetch = useApi(true)

// steam demo
// const response = await api.fetch(getStreamApi, 'get', data, {
//     onResponse: () => {},
//     headers: {
//         accept: '*/*',
//     },
//     responseType: 'stream',
// })

// blob demo
// const response = await api.fetch(getStreamApi, 'get', data, {
//     onResponse: () => {},
//     headers: {
//         accept: '*/*',
//     },
//     responseType: 'blob',
// })
// const blobUrl = window.URL.createObjectURL(response)
