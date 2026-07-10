import type { RouteLocationRaw } from 'vue-router'

/**
 * 返回导航
 * @param fallbackRoute 默认路由
 * @returns 返回导航
 */
export function useBackNavigation(fallbackRoute: RouteLocationRaw = '/') {
    const router = useRouter()
    const canGoBack = ref(false)

    const checkCanGoBack = () => {
        // 检测历史记录长度
        canGoBack.value = window.history.length > 1 && router.options.history.state.back !== null
    }

    const backOrRedirect = (customFallback: RouteLocationRaw) => {
        if (canGoBack.value) {
            router.go(-1)
        }
        else {
            router.push(customFallback || fallbackRoute)
        }
    }

    onMounted(() => {
        checkCanGoBack()
    })

    // 监听路由变化
    router.afterEach(() => {
        checkCanGoBack()
    })

    return {
        canGoBack,
        backOrRedirect,
        checkCanGoBack,
    }
}
