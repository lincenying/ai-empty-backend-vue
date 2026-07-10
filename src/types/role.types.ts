import type { Page } from './components.types'

export interface RolesForm {
    roleId: string
    roleName: string
    roleType: number
}

export interface RoleList {
    root: RoleListRoot[]
}

/** 选中角色用户列表 > 单条数据 > 权限列表 */
export interface RoleListRoot {
    channel: string
    createTime?: any
    currPage: number
    currentRecord: number
    defaultRole: string
    deletion: number
    ids: any[]
    isDefault: number
    num: string
    page: Page
    pageSize: number
    pagination: boolean
    roleId: string
    roleName: string
    roleType: number
    search: string
    sort: number
    token: string
    userId: string
}

/** 选中角色用户列表 > 单条数据 */
export interface RoleUserListRoot {
    channel: string
    createDate?: any
    currPage: number
    currentRecord: number
    defaultUser: string
    deletion: number
    dept: string
    deptNames: string
    depts: any[]
    deviceId: string
    findUser: string
    ids: any[]
    loginName: string
    newPassword: string
    num: string
    page: Page
    pageSize: number
    pagination: boolean
    password: string
    positionList: any[]
    positions: any[]
    roleList: RoleListRoot[]
    roles: any[]
    search: string
    state: string
    token: string
    tokenDate?: any
    userId: string
    userIds: any[]
    userName: string
    userState: number
    webToken: string
    webTokenDate?: any
}

/** 选中角色用户列表 */
export interface RoleUserList {
    root: RoleUserListRoot[]
    totalProperty: number
}

/** 菜单树/权限树 > 单条数据 */
export interface MenuTreeRoot {
    channel: string
    checked: number
    currPage: number
    currentRecord: number
    iconSelection: string
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
    subMenuList: MenuTreeRoot[]
    token: string
    type: number
    userId: string
}

/** 菜单树 */
export interface MenuTree {
    root: MenuTreeRoot[]
}

/** 用户列表 > 单条数据 */
export interface UserListRoot {
    deptsList: string
    loginName: string
    positionList: string
    roleList: string
    token: string
    userId: string
    userName: string
    userState: number
}

/** 用户列表(不分页) */
export interface UserList {
    root: UserListRoot[]
}

/** 选中角色菜单权限 */
export interface AuthorityList {
    root: MenuTreeRoot[]
}

/** 用户配置表单 */
export interface FormObj {
    roleId?: string
    selects?: string[]
    data?: UserListRoot[]
}
