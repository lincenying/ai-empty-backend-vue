<template>
    <header class="layout-header mx-20px mt-20px h-56px shrink-0 rounded-10px bg-hex-E2E8FF">
        <div flex="~ items-center justify-between" class="h-full px-24px">
            <div flex="~ items-center" class="gap-10px">
                <span h-14px w-4px rounded-2px class="bg-base-color"></span>
                <span un-text="14px hex-31373D" font-600>快捷导航</span>
            </div>
            <nav flex="~ items-center" class="gap-8px h-full">
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
    </header>
</template>

<script setup lang="ts">
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

/** 顶部外站导航列表 */
const externalNavList: IExternalNavItem[] = [
    { label: '官方门户', url: 'https://www.example.com', icon: 'i-lucide-globe' },
    { label: '产品文档', url: 'https://docs.example.com', icon: 'i-lucide-book-open' },
    { label: '开放平台', url: 'https://open.example.com', icon: 'i-lucide-code-xml' },
    { label: '技术支持', url: 'https://support.example.com', icon: 'i-lucide-headset' },
]
</script>
