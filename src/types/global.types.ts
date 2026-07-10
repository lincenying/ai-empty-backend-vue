import type { AxiosRequestConfig, Method } from 'axios'
import type { DataType, PermissionObject } from './components.types'

export interface LabelValue {
    label: string
    value: string | number | boolean
    className?: 'unactive' | 'active' | 'warning' | 'error' | 'open'
}

export interface CreateTime {
    date: number
    day: number
    hours: number
    minutes: number
    month: number
    seconds: number
    time: number
    timezoneOffset: number
    year: number
}

export interface AppInfo {
    appName: string
    appVersion: string
    isDEV: boolean
    isProd: boolean
    ENV: string
}

export interface ServiceType {
    url: string
    method?: Method
    data: Objable
    /** 是否验证code, 默认:true */
    needCheckCode?: boolean
    /** 请求头 */
    headers?: AxiosRequestConfig['headers']
    /** 超时时间 */
    timeout?: number
    /** 上传处理进度事件 */
    onUploadProgress?: AxiosRequestConfig['onUploadProgress']
    /** 下载处理进度事件 */
    onDownloadProgress?: AxiosRequestConfig['onDownloadProgress']
    /** 取消接口请求Key */
    abortKey?: string
    /** 其他axios配置 */
    otherConfig?: AxiosRequestConfig
    [key: string]: any
}

/** 全局弹窗数据 */
export interface GlobalDialogLayer<T = Objable> {
    /** 是否显示弹窗 */
    show: boolean
    /** 弹窗标题 */
    title: string
    /** 是否显示按钮 */
    showButton?: boolean
    /** 是否显示取消按钮 */
    showCancel?: boolean
    /** 数据 */
    row?: T
    /** 弹窗宽度 */
    width?: string
    /** 权限 */
    auth: PermissionObject
    /** 禁用按钮 */
    disabledBtn: boolean
    /** loading按钮 */
    loadingBtn: boolean
    [propName: string]: any
}

export interface UpdatePageType {
    key: keyof GlobalTablePage
    value: any
}

export interface GlobalTablePage {
    currPage: number
    pageSize: number
    total: number
}

/** 全局表格Props */
export interface GlobalTableProps<T> {
    propKey?: T
    /** 表格数据 */
    data?: DataType<T>[]
    /** 是否显示序号, 默认值: false */
    showIndex?: boolean
    /** 是否显示多选框, 默认值: false */
    showSelection?: boolean
    /** 是否显示分页, 默认值: true */
    showPage?: boolean
    /** 分页数据, 默认值: { index: 1, size: 20, total: 0 } */
    page?: GlobalTablePage
    /** 设置分页的组件, 默认值: 'total, sizes, prev, pager, next, jumper' */
    pageLayout?: string
    /** 设置分页下拉框可选的值, 默认值: [10, 20, 50, 100] */
    pageSizes?: number[]
    /** 其他 el-table 属性 */
    tableConfig?: Record<string, any>
    /** 其他 el-pagination 属性 */
    pageConfig?: Record<string, any>
}
