<template>
    <aside
        :class="isCollapse ? 'w-64px is-collapse' : 'w-200px no-collapse'"
        class="menu-aside relative transition-width-ease-2 bg-hex-E2E8FF m-20px rounded-10px"
    >
        <section class="flex-col w-full h-full overflow-hidden menu-box rounded-10px">
            <main flex="auto" min-h-1px>
                <div class="menu-area h-full">
                    <el-scrollbar class="h-full">
                        <global-menu :menu-by-authority="homeMenu" :is-collapse="isCollapse"></global-menu>
                    </el-scrollbar>
                </div>
            </main>
        </section>
        <el-tooltip
            class="box-item"
            effect="dark"
            :content="isCollapse ? '展开菜单' : '折叠菜单'"
            placement="right"
        >
            <div class="aside-collapse-btn" cursor-pointer @click="isCollapse = !isCollapse">
                <i class="aside-collapse-icon inline-block" :class="!isCollapse ? 'i-lucide-chevron-first' : 'i-lucide-chevron-last'"></i>
            </div>
        </el-tooltip>
    </aside>
</template>

<script setup lang="ts">
import useMenuStore from '~/stores/use-menu-store'

defineOptions({
    name: 'LayoutAside',
})

const isCollapse = ref(false)

const menuStore = useMenuStore()
const { menuByAuthority } = storeToRefs(menuStore)

/** 读取后台模块的子菜单 */
const homeMenu = computed(() => {
    // return menuByAuthority.value.find(item => item.showName === backendName)?.subMenuList || []
    return menuByAuthority.value || []
})
</script>
