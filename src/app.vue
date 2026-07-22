<template>
    <div v-loading="loading" element-loading-text="数据加载中, 请稍等..." class="w-full h-full app-main">
        <ElConfigProvider :locale="locale">
            <template v-if="!loading">
                <layout-router v-if="['default'].includes(layout)"></layout-router>
                <router-view v-else></router-view>
            </template>
        </ElConfigProvider>
    </div>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import emitter from './composables/emitter'
import layoutRouter from './layouts/layout-router.vue'

import useMenuStore from './stores/use-menu-store'
import { useUserStore } from './stores/use-user-store'
import { checkNeedLogin } from './utils'
import TimestampChecker from './utils/check-reload'

const router = useRouter()

const layout = computed(() => {
    const route = router.currentRoute.value
    return route.meta.layout || 'default'
})

const route = useRoute()
/** 首屏路由就绪后才允许重置进度条，避免刷新 / 首次打开误触发 */
const routeWatchReady = ref(false)

router.isReady().then(() => {
    // 等首屏导航（含守卫内重定向）完全结束后再开启
    nextTick(() => {
        routeWatchReady.value = true
    })
})

watch(() => route.fullPath, (newPath, oldPath) => {
    // oldPath 为 undefined 表示首次回调；首屏未就绪时一律跳过
    if (!routeWatchReady.value || oldPath == null || oldPath === newPath)
        return
    emitter.emit('nprogress-reset')
})

const menuStore = useMenuStore()
const userStore = useUserStore()

const locale = reactive(zhCn)

const loading = ref(true)

async function getBaseData() {
    if (!checkNeedLogin()) {
        try {
            await Promise.all([
                menuStore.getMenuByAuthority(),
                menuStore.getButtonAuthority(),
                userStore.getUserInfo(),
            ])
        }
        catch (error) {
            console.log(error)
            router.push('/404')
        }
        finally {
            loading.value = false
        }
    }
    else {
        loading.value = false
    }
}

/**
 * 监听路由变化，如果从登录页跳转到其他页面，则重新获取基础数据
 */
watch(() => router.currentRoute.value.path, (val, oldVal) => {
    if (oldVal === '/login' && val !== '/login') {
        getBaseData()
    }
})

onBeforeMount(async () => {
    await getBaseData()
})

if (!import.meta.env.DEV && import.meta.env.SSR !== true) {
    const timestampChecker = new TimestampChecker()

    // 开始检查
    timestampChecker.start()

    // 如果需要停止检查
    // timestampChecker.stop();

    // 获取当前存储的时间戳
    // const current = timestampChecker.getCurrentTimestamp();

    // 清空时间戳
    // timestampChecker.clearTimestamp();

    function handleTimestampChanged(event: Event) {
        const customEvent = event as CustomEvent
        console.log('时间戳变化事件:', customEvent.detail)
        if (!timestampChecker.instance) {
            timestampChecker.stop()
            timestampChecker.instance = ElNotification({
                type: 'success',
                title: '通知',
                dangerouslyUseHTMLString: true,
                message: '<div>新内容可用，单击<b style="color: red; cursor: pointer;">这里</b>更新 (更新前请确认所有内容都已保存)</div>',
                onClick() {
                    window.location.reload()
                },
                onClose() {
                    timestampChecker.start()
                    timestampChecker.instance = null
                },
                duration: 0,
            })
        }
    }

    // 监听自定义事件

    function onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            console.log(`已离开页面, 取消检查更新心跳`)
            timestampChecker.stop()
        }
        else if (document.visibilityState === 'visible') {
            console.log(`已进入页面, 重新开始检查更新心跳`)
            if (!timestampChecker.instance)
                timestampChecker.start()
        }
    }

    onMounted(() => {
        window.addEventListener('timestamp-changed', handleTimestampChanged)
        document.addEventListener('visibilitychange', onVisibilityChange)
    })

    onUnmounted(() => {
        document.removeEventListener('visibilitychange', onVisibilityChange)
        window.removeEventListener('timestamp-changed', handleTimestampChanged)
    })
}
</script>
