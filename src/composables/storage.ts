import type { UserInfo } from '~/types/login.types'

/** 登录用户名 */
export const userStorage = useStorage<string>('user', '')
/** 登录用户 */
export const userNameStorage = useStorage<string>('user-name', '')
/** 登录用户ID */
export const userIdStorage = useStorage<string>('user-id', '')
/** 登录用户密码 */
export const passwordStorage = useStorage<string>('password', '')
/** 是否记住密码 */
export const remberStorage = useStorage<boolean>('is-rember', false)
/** 登录Token */
export const tokenStorage = useStorage<string>('token', '')
/** 登录用户数据 */
export const loginDataStorage = useStorage<UserInfo>('login-data', {} as UserInfo)

/** 进入管理页面时的最后页面 */
export const lastAdminPageStorage = useStorage<string>('last-admin-page', '')

/** 清除登录数据 */
export function clearLoginData() {
    tokenStorage.value = ''
    // eslint-disable-next-line node/prefer-global/process
    if (process.env.NODE_ENV !== 'development') {
        userNameStorage.value = ''
        userIdStorage.value = ''
        loginDataStorage.value = null
    }
}
