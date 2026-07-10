import type { Page } from './components.types'

/** 用户权限菜单 > 单条数据 */
export interface MenuByAuthorityRoot {
    channel: string
    checked: number
    currPage: number
    currentRecord: number
    iconSelection: string
    iconHover: string
    iconShow: string
    ids: any[]
    menuId: string
    menuName: string
    num: string
    orderList: any[]
    page: Page
    pageSize: number
    pagination: boolean
    parentId: string
    path: string
    remark: string
    search: string
    showIcon: number
    showName: string
    sign: string
    sort: number
    style: string
    subMenuList: MenuByAuthorityRoot[]
    token: string
    type: number
    userId: string
}

/** 用户权限菜单 */
export interface MenuByAuthority {
    root: MenuByAuthorityRoot[]
}

export interface FormFileType {
    fileId: string | number
    accessAddress: string
}

/** 菜单管理 > 新增/编辑表单 */
export interface MneuFormType {
    menuId?: string
    menuName?: string
    parentId?: string
    parentName?: string
    remark?: string
    showName?: string
    path?: string
    type?: number
    showIcon?: number
    iconShow?: FormFileType[]
    iconHover?: FormFileType[]
    iconSelection?: FormFileType[]
    isleaf?: boolean
}

/** 菜单管理 > 新增/编辑表单 > 保存时的参数 */
export interface MneuParamsType {
    menuId?: string
    menuName?: string
    parentId?: string
    parentName?: string
    remark?: string
    showName?: string
    path?: string
    type?: number
    showIcon?: number
    iconShow?: string
    iconHover?: string
    iconSelection?: string
    isleaf?: boolean
}

/** 菜单管理 > 新增/编辑表单 > 按钮表单参数 */
export interface BtnFormType {
    parentId: string
    menuId?: string
    menuName: string
    showName: string
    path: string
    sign: string
    remark: string
    type: number
    style: string
    showIcon: number
}

/** 编辑按钮数据 */
export interface MenuBtnForm {
    sign: string
    menuName: string
    showName: string
    path: string
    remark: string
}
