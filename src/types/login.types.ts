import type { RoleListRoot } from './role.types'

/** 登录接口返回数据 */
export interface UserInfo {
    loginName: string
    password: string
    roleList: RoleListRoot[]
    token: string
    userId: string
    userName: string
    userState: number
    isStrongPassword: boolean
    positionList: any[]
}
