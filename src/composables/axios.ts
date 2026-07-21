import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import type { ServiceType } from '~/types/global.types'
import axios from 'axios'
import qs from 'qs'
import { getBaseUrl, isSSR } from '~/config'
import { checkNeedLogin } from '~/utils'
import emitter from './emitter'
import { clearLoginData, tokenStorage, userIdStorage } from './storage'

/** 与 HTTP 200 对齐的业务 code 字段 */
const HTTP_CODE_OK = 200

/** 后端约定成功状态码 */
const STATUS_SUCCESS = '000000'

/** Token 过期等业务码 */
const TOKEN_EXPIRED_CODES = ['200002', '200003'] as const

/** 视为业务成功的 code / statusCode 集合 */
const BUSINESS_SUCCESS_CODES: ReadonlyArray<string | number> = [
    1000,
    '1000',
    STATUS_SUCCESS,
    '200',
    200,
]

const baseURL = getBaseUrl()

const defaultHeaders: AxiosRequestConfig['headers'] = {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
}

/**
 * 将鉴权字段并入普通对象或 FormData
 */
function mergeAuthIntoPayload(
    data: Objable | FormData | undefined,
    token: { userId: string, token: string },
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

/**
 * 根据 url、method、data 生成用于取消请求的 key（含时间戳，避免并发场景下误复用）
 */
function buildAbortRequestKey(config: Pick<ServiceType, 'url' | 'method' | 'data'>): string {
    const { url, method, data } = config
    let serialized: string
    if (typeof data === 'object' && data !== null && !(data instanceof FormData))
        serialized = qs.stringify(data as Objable)
    else
        serialized = String(data ?? '')
    return [url, method ?? 'get', serialized, Date.now()].join('&')
}

/**
 * 归一化业务体：兼容 data/result 字段与 JSON 字符串 result
 */
function normalizeBusinessPayload<T>(payload: ResponseData<T>): void {
    try {
        const body = payload as Objable
        if (body.data != null && body.result == null) {
            body.result = body.data
            body.data = undefined
        }
        if (typeof body.result === 'string')
            body.result = JSON.parse(body.result) as T

        const nested = body._data
        if (nested != null && typeof nested === 'object' && 'data' in nested)
            (nested as Objable).data = undefined
    }
    catch {
        // 保持原始 payload，由后续 checkCode 处理
    }
}

const http = axios.create({
    baseURL,
    headers: defaultHeaders,
    timeout: 30000,
    withCredentials: false,
    responseType: 'json',
    /** 在业务层统一解析 HTTP 状态，避免非 2xx 被直接 reject 后无法走 checkStatus */
    validateStatus: () => true,
})

http.interceptors.request.use(
    (config) => {
        emitter.emit('nprogress-start', { type: 'api', url: config.url ?? '' })
        return config
    },
    (error) => {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)))
    },
)

http.interceptors.response.use(
    (response) => {
        emitter.emit('nprogress-done', { type: 'api', url: response.config.url ?? '' })
        return response
    },
    (error) => {
        emitter.emit('nprogress-done', { type: 'api', url: error.config?.url ?? '' })
        return Promise.reject(error)
    },
)

/** 全局变量对象，专门存放所有请求的 cancel 方法 */
const pendingRequest = new Map<string, AbortController>()

export class ApiClient {
    /** 是否需要取消请求 */
    needAbort = false

    /** 取消请求的 Key */
    abortKey = ''

    constructor(needAbort?: boolean) {
        if (needAbort)
            this.needAbort = true
    }

    /**
     * 生成 request 的唯一标识
     */
    generateRequestKey(config: ServiceType) {
        return buildAbortRequestKey({
            url: config.url,
            method: config.method,
            data: config.data,
        })
    }

    /**
     * 取消请求
     */
    abortRequest(abortKey: string = this.abortKey) {
        if (!pendingRequest.has(abortKey))
            return
        const controller = pendingRequest.get(abortKey)
        controller?.abort('取消请求')
        pendingRequest.delete(abortKey)
    }

    async fetch<T>(options: ServiceType): Promise<ResponseData<T>> {
        const {
            url,
            method = 'get',
            headers,
            timeout,
            onUploadProgress,
            onDownloadProgress,
            abortKey = this.abortKey,
            otherConfig = {},
        } = options

        const token = this.getToken()

        const config: AxiosRequestConfig = {
            headers: {
                ...defaultHeaders,
                ...headers,
            },
            method,
            baseURL,
            url,
            timeout: 30000,
            withCredentials: false,
            responseType: 'json',
            ...otherConfig,
        }
        if (typeof timeout === 'number')
            config.timeout = timeout

        if (abortKey) {
            if (pendingRequest.has(abortKey)) {
                pendingRequest.get(abortKey)?.abort('取消请求')
                pendingRequest.delete(abortKey)
            }
            const controller = new AbortController()
            pendingRequest.set(abortKey, controller)
            config.signal = controller.signal
        }

        if (typeof onUploadProgress === 'function')
            config.onUploadProgress = onUploadProgress
        if (typeof onDownloadProgress === 'function')
            config.onDownloadProgress = onDownloadProgress

        const payload = mergeAuthIntoPayload(options.data, token)
        config[method === 'get' ? 'params' : 'data'] = payload

        if (url.includes('NoTimeout'))
            config.timeout = 0

        try {
            const response = await http.request<ResponseData<T>>(config)
            if (abortKey && pendingRequest.has(abortKey))
                pendingRequest.delete(abortKey)
            return this.checkStatus<T>(response)
        }
        catch (error) {
            if (abortKey && pendingRequest.has(abortKey))
                pendingRequest.delete(abortKey)
            return this.normalizeRequestError<T>(error)
        }
    }

    /**
     * 将网络错误 / 取消请求转为与业务一致的 ResponseData 形态
     */
    private normalizeRequestError<T>(error: unknown): ResponseData<T> {
        if (axios.isCancel(error)) {
            return {
                statusCode: '-1',
                result: null as T,
                message: '取消请求',
                isCancel: true,
            } as ResponseData<T>
        }
        let message = '请求失败'
        if (error instanceof Error)
            message = error.message
        else if (typeof error === 'string')
            message = error
        return {
            statusCode: '-404',
            result: null as T,
            message,
            isCancel: false,
        } as ResponseData<T>
    }

    async RESTful<T>(options: ServiceType): Promise<ResponseData<T>> {
        if (this.needAbort)
            this.abortKey = options.abortKey || this.generateRequestKey(options)

        const response = await this.fetch<T>(options)
        if (response) {
            normalizeBusinessPayload(response)
            if (import.meta.env.DEV)
                console.log(`%c[axios: ${baseURL + options.url}] >> `, 'color: red', response.result)
        }

        if ((options.needCheckCode ?? true) && response)
            return this.checkCode<T>(response)
        return response
    }

    /**
     * 解析 post/get/put/delete 的多重入参形式
     */
    private parseArgs<T>(method: Method, ...args: unknown[]): Promise<ResponseData<T>> {
        const first = args[0]
        if (first != null && typeof first === 'object' && !Array.isArray(first) && 'url' in first) {
            return this.RESTful<T>({
                ...(first as ServiceType),
                method,
            })
        }

        const keys = [
            'url',
            'data',
            'timeout',
            'headers',
            'onUploadProgress',
            'onDownloadProgress',
            'needCheckCode',
            'abortKey',
        ] as const
        const params = {} as ServiceType
        for (const [index, key] of keys.entries()) {
            const value = args[index]
            if (value !== undefined)
                (params as Objable)[key] = value
        }
        return this.RESTful<T>({ ...params, method })
    }

    post<T = void>(
        url: string,
        data?: Objable,
        timeout?: number,
        headers?: AxiosRequestConfig['headers'],
        onUploadProgress?: AxiosRequestConfig['onUploadProgress'],
        onDownloadProgress?: AxiosRequestConfig['onDownloadProgress'],
        needCheckCode?: boolean,
        abortKey?: string,
    ): Promise<ResponseData<T>>
    post<T = void>(options: ServiceType): Promise<ResponseData<T>>
    /**
     * 发送 POST 请求
     */
    post<T = void>(...args: unknown[]) {
        return this.parseArgs<T>('post', ...args)
    }

    get<T = void>(
        url: string,
        data?: Objable,
        timeout?: number,
        headers?: AxiosRequestConfig['headers'],
        onUploadProgress?: AxiosRequestConfig['onUploadProgress'],
        onDownloadProgress?: AxiosRequestConfig['onDownloadProgress'],
        needCheckCode?: boolean,
        abortKey?: string,
    ): Promise<ResponseData<T>>
    get<T = void>(options: ServiceType): Promise<ResponseData<T>>
    /**
     * 发送 GET 请求
     */
    get<T = void>(...args: unknown[]) {
        return this.parseArgs<T>('get', ...args)
    }

    put<T = void>(
        url: string,
        data?: Objable,
        timeout?: number,
        headers?: AxiosRequestConfig['headers'],
        onUploadProgress?: AxiosRequestConfig['onUploadProgress'],
        onDownloadProgress?: AxiosRequestConfig['onDownloadProgress'],
        needCheckCode?: boolean,
        abortKey?: string,
    ): Promise<ResponseData<T>>
    put<T = void>(options: ServiceType): Promise<ResponseData<T>>
    /**
     * 发送 PUT 请求
     */
    put<T = void>(...args: unknown[]) {
        return this.parseArgs<T>('put', ...args)
    }

    delete<T = void>(
        url: string,
        data?: Objable,
        timeout?: number,
        headers?: AxiosRequestConfig['headers'],
        onUploadProgress?: AxiosRequestConfig['onUploadProgress'],
        onDownloadProgress?: AxiosRequestConfig['onDownloadProgress'],
        needCheckCode?: boolean,
        abortKey?: string,
    ): Promise<ResponseData<T>>
    delete<T = void>(options: ServiceType): Promise<ResponseData<T>>
    /**
     * 发送 DELETE 请求
     */
    delete<T = void>(...args: unknown[]) {
        return this.parseArgs<T>('delete', ...args)
    }

    /**
     * 检查响应状态
     */
    checkStatus<T>(response: AxiosResponse<ResponseData<T>>) {
        if (response && (response.status === 200 || response.status === 304)) {
            const data = (response.data ?? {}) as ResponseData<T>
            return {
                ...data,
                code: data.statusCode === STATUS_SUCCESS ? HTTP_CODE_OK : Number(data.statusCode),
            } as ResponseData<T>
        }
        return {
            statusCode: '-404',
            result: null as T,
            message: response?.statusText || '请求失败',
            isCancel: false,
        } as ResponseData<T>
    }

    /**
     * 检查响应业务码
     */
    checkCode<T>(data: ResponseData<T>) {
        if (TOKEN_EXPIRED_CODES.includes(data.statusCode as (typeof TOKEN_EXPIRED_CODES)[number])) {
            if (!checkNeedLogin()) {
                clearLoginData()
                emitter.emit('need-login')
            }
            return {
                code: -404,
                statusCode: '-404',
                message: '登录过期，请重新登录',
                result: null as T,
            } as ResponseData<T>
        }

        const ok = BUSINESS_SUCCESS_CODES.includes(data.statusCode) || BUSINESS_SUCCESS_CODES.includes(data.code)
        if (!ok) {
            if (!data.isCancel && !isSSR) {
                emitter.emit(
                    'api-error',
                    data.message || (data as Objable).error || '请求失败',
                )
            }
            return {
                code: -404,
                statusCode: '-404',
                message: data.message || '请求失败',
                result: null as T,
            } as ResponseData<T>
        }
        return data
    }

    getToken() {
        const userId = userIdStorage.value
        const token = tokenStorage.value
        return {
            userId,
            token,
        }
    }
}

/**
 * 发送 POST 请求示例
 * @description
```
$axios.post('/api/login', {}, 30000,
    {
        'Content-Type': 'application/json',
    },
    (progressEvent) => {
        console.log(progressEvent)
    },
    (progressEvent) => {
        console.log(progressEvent)
    },
    false,
)
$axios.post({
    url: '/api/login',
    data: {},
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    onUploadProgress: (progressEvent) => {
        console.log(progressEvent)
    },
    onDownloadProgress: (progressEvent) => {
        console.log(progressEvent)
    },
    needCheckCode: false,
})
```
 */
export const $axios = new ApiClient()
