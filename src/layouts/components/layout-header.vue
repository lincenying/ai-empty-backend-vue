<template>
    <header class="layout-header mx-20px mt-20px h-56px shrink-0 rounded-10px bg-hex-E2E8FF">
        <div flex="~ items-center justify-between" class="h-full px-24px">
            <div flex="~ items-center" class="gap-8px min-w-0">
                <div class="sys-title title shrink-0">
                    <span>{{ title }}</span>
                </div>
                <nav flex="~ items-center" class="gap-8px h-full ml-16px">
                    <a
                        v-for="item in externalNavList"
                        :key="item.url"
                        :href="item.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="layout-header-link"
                        flex="~ items-center"
                        cursor-pointer
                        rounded-8px
                        px-14px
                        py-8px
                        un-text="13px hex-31373D"
                    >
                        <i v-if="item.icon" :class="item.icon" class="text-14px mr-6px"></i>
                        <span>{{ item.label }}</span>
                        <i class="i-lucide-external-link text-12px ml-6px opacity-60"></i>
                    </a>
                </nav>
            </div>
            <div flex="~ items-center" class="shrink-0">
                <ElPopover placement="bottom-end" :width="150" trigger="click">
                    <template #reference>
                        <div class="chat-menu-item" cursor-pointer>
                            <i class="chat-menu-icon i-lucide-user-round"></i>
                        </div>
                    </template>
                    <ul class="drop-menu">
                        <li flex="~ items-center" cursor-pointer rounded-5px px-10px py-5px @click="handleExit">
                            <el-icon><SwitchButton /></el-icon>
                            <span ml-6px>退出登录</span>
                        </li>
                    </ul>
                </ElPopover>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { SwitchButton } from '@element-plus/icons-vue'
import { clearLoginData } from '~/composables/storage'

/** 外站导航项 */
interface IExternalNavItem {
    /** 显示名称 */
    label: string
    /** 外站地址 */
    url: string
    /** 图标 class（UnoCSS icons） */
    icon?: string
}

defineOptions({
    name: 'LayoutHeader',
})

const router = useRouter()
const title = ref('认知大模型正式版')

/** 顶部外站导航列表 */
const externalNavList: IExternalNavItem[] = [
    { label: '官方门户', url: 'https://www.example.com', icon: 'i-lucide-globe' },
    { label: '产品文档', url: 'https://docs.example.com', icon: 'i-lucide-book-open' },
    { label: '开放平台', url: 'https://open.example.com', icon: 'i-lucide-code-xml' },
    { label: '技术支持', url: 'https://support.example.com', icon: 'i-lucide-headset' },
]

/** 退出登录 */
function handleExit() {
    clearLoginData()
    router.replace('/login')
}

onMounted(() => {
    document.title = title.value
})
</script>
