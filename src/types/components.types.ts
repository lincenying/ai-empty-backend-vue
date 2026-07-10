import type { Toolbar } from '@wangeditor/editor'
import type { ComponentExposed } from 'vue-component-type-helpers'
import type { IDemoListItem } from './demo.types'
import type { MenuTreeRoot } from './role.types'
import type globalDialog from '~/components/global-dialog.vue'
import type globalTable from '~/components/global-table.vue'

export type {
    FormInstance as ElFormInstance,
    PopoverInstance as ElPopoverInstance,
    ScrollbarInstance as ElScrollbarInstance,
    InputInstance,
    TableInstance,
    TreeInstance,
} from 'element-plus'

export type ToolbarInstance = InstanceType<typeof Toolbar>

export type GlobalDialogInstance = InstanceType<typeof globalDialog>
export type GlobalTableInstance = ComponentExposed<typeof globalTable>
export type DeptTreeInstance = InstanceType<typeof DeptTree>

/** 角色下拉列表 > page */
export interface Page {
    countId: string
    current: number
    maxLimit: number
    optimizeCountSql: boolean
    orders: any[]
    pages: number
    records: any[]
    searchCount: boolean
    size: number
    total: number
}

/** 用户权限菜单的按钮权限 */
export interface ButtonAuthority {
    root: MenuTreeRoot[]
}

/** 文件信息 */
export interface UploadFileList {
    fileName?: string
    filename?: string
    extension?: string
    fileId: string | number
    loading?: boolean
    progress?: number
    loaded?: number
    size?: number
    updateTime?: number
    speed?: string
    accessAddress?: string
    breviaryAddress?: string
    fileDescription?: string
}

export interface TypeMap {
    anyData: any
    /** 示例管理 */
    demo: IDemoListItem
}

export type DataType<Key> = Key extends keyof TypeMap ? TypeMap[Key] : unknown

/** 全局权限配置 */

export interface PermissionChild {
    menuId: string
    menuName: string
    path: string
    type: number
}

type PermissionAction = 'READ' | 'DOWNLOAD' | 'DETAIL' | 'UPDATE' | 'DELETE' | 'ADD' | 'CHECK' | 'PUSH' | 'BATCH_DELETE'
    | 'UPDATE_USER' | 'UPDATE_MENU'
    | 'ROLE_READ' | 'ROLE_ADD' | 'ROLE_UPDATE' | 'ROLE_DELETE'
    | 'DEPT_ADD' | 'DEPT_UPDATE' | 'DEPT_DELETE' | 'DEPT_READ'
    | 'USER_ADD' | 'USER_READ' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_RESET' | 'ORDER'

export type PermissionObject = {
    [K in PermissionAction]: boolean
} & {
    [K in PermissionAction as `${K}_path`]: string
} & {
    [K in PermissionAction as `${K}_type`]: string
} & {
    menuId: string
    children: PermissionChild[]
}

export interface ImageFile {
    fileId: string
    fileName: string
    createTime: number
    accessAddress: string
}
