import type { UserInfo } from '~/types/login.types'
import { acceptHMRUpdate } from 'pinia'
import { $api } from '~/composables/fetch'
import { getMyInfoApi } from '~/config/api'

interface UserState {
    userInfo: UserInfo
}

export const useUserStore = defineStore('userUsertore', () => {
    const state: UserState = reactive({
        userInfo: {} as UserInfo,
    })

    /** 获取用户信息 */
    async function getUserInfo() {
        const { result } = await $api.post<UserInfo>(getMyInfoApi, {})
        if (result)
            state.userInfo = result
    }

    function setUserInfo(info: UserInfo) {
        state.userInfo = info
    }

    return {
        ...toRefs(state),
        getUserInfo,
        setUserInfo,
    }
})

export default useUserStore

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
