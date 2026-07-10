/**
 * Null 或者 Undefined 或者 T
 */
declare type Nullable<T> = T | null | undefined
/**
 * 非 Null 类型
 */
declare type NonNullable<T> = T extends null | undefined ? never : T
/**
 * 数组<T> 或者 T
 */
declare type Arrayable<T> = T | T[]
/**
 * 键为字符串, 值为 Any 的对象
 */
declare type Objable<T = any> = Record<string, T>
/**
 * Function
 */
declare type Fn<T = void> = () => T
/**
 * 任意函数
 */
declare type AnyFn<T = any> = (...args: any[]) => T

declare type PromiseFn<T> = (...args: any[]) => Promise<T>
/**
 * Promise, or maybe not
 */
declare type Awaitable<T> = T | PromiseLike<T>

/**
 * 部分可选
 */
declare type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 深度只读
 */
declare type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

declare interface ResDataLists<T> {
    list: T
    pager: {
        page: number
        pageSize: number
        total: number
    }
}

/**
 * 接口返回模板
 * ```
 * {
    result: T
    statusCode: string
    message: string
    info?: string
 * }
 * ```
 */
declare interface ResponseData<T> {
    result: T
    statusCode: string
    message: string
    [propName: string]: any
}

type Methods = 'get' | 'post' | 'delete' | 'put'

declare interface ApiType {
    get: <T>(
        url: string,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T>>
    get: <T, U = Objable>(
        url: string,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T> & U>
    post: <T>(
        url: string,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T>>
    post: <T, U = Objable>(
        url: string,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T> & U>
    put: <T>(
        url: string,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T>>
    put: <T, U = Objable>(
        url: string,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T> & U>
    delete: <T>(
        url: string,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T>>
    delete: <T, U = Objable>(
        url: string,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T> & U>
    downFile: (url: string, method: Methods, data?: Objable) => Promise<any>
    RESTful: <T>(
        url: string,
        method: Methods,
        data?: Objable,
        header?: Objable,
        checkCode?: boolean,
    ) => Promise<ResponseData<T>>
    $RESTful: <T>(
        url: string,
        method: Methods,
        data?: Objable,
        header?: Objable,
    ) => Promise<ResponseData<T>>
}

declare type FetchOptions = import('ofetch').FetchOptions & {
    disabledProgress?: boolean
}

declare interface FetchApiType {
    abortKey: string
    /** @deprecated 拼写错误，请使用 getAbortKey */
    getAbourtKey: () => string
    getAbortKey: () => string
    abortRequest: (abortKey?: string) => void
    generateRequestKey: (config: ServiceType) => string
    get: <T>(url: string, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T>>
    get: <T, U = Objable>(url: string, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T> & U>
    post: <T>(url: string, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T>>
    post: <T, U = Objable>(url: string, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T> & U>
    put: <T>(url: string, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T>>
    put: <T, U = Objable>(url: string, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T> & U>
    delete: <T>(url: string, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T>>
    delete: <T, U = Objable>(url: string, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T> & U>
    RESTful: <T>(url: string, method: Methods, data?: Objable, options?: FetchOptions) => Promise<ResponseData<T>>
    fetch: (url: string, method: Methods, data?: Objable, options?: FetchOptions) => Promise<any>
}

declare interface Window {
    $$lock?: boolean
    $$api: ApiType
    $$fetch: FetchApiType
    $$time: NodeJS.Timeout
    axios: import('axios').AxiosStatic
}
