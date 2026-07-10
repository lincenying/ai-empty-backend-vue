import type { AppInfo } from '~/types/global.types'
import { acceptHMRUpdate } from 'pinia'

interface AppInfoState {
    appInfo: AppInfo
    cacheComponent: string[]
}

export const useAppInfoStore = defineStore('userAppInfotore', () => {
    const state: AppInfoState = reactive({
        appInfo: {
            appName: import.meta.env.VITE_APP_TITLE,
            appVersion: import.meta.env.VITE_APP_VERSION,
            isDEV: import.meta.env.VITE_APP_ENV === 'development',
            isProd: import.meta.env.VITE_APP_ENV === 'production',
            isTest: import.meta.env.VITE_APP_ENV === 'test',
            ENV: import.meta.env.VITE_APP_ENV,
        },
        cacheComponent: [],
    })

    function setAppInfo(info: AppInfo) {
        state.appInfo = info
    }

    function setCacheComponent(info: string | string[]) {
        if (typeof info === 'string') {
            if (!state.cacheComponent.includes(info)) {
                state.cacheComponent.push(info)
            }
        }
        else if (Array.isArray(info)) {
            info.forEach((item) => {
                if (!state.cacheComponent.includes(item)) {
                    state.cacheComponent.push(item)
                }
            })
        }
    }

    return {
        ...toRefs(state),
        setAppInfo,
        setCacheComponent,
    }
})

export default useAppInfoStore

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAppInfoStore, import.meta.hot))
}
