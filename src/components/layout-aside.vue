<template>
    <aside :class="isCollapse ? 'w-64px is-collapse' : 'w-200px no-collapse'" class="menu-aside transition-width-ease-2 overflow-hidden bg-hex-E2E8FF m-20px rounded-10px">
        <section class="flex-col w-full h-full menu-box">
            <header class="title-box">
                <div class="sys-title title my-15px" :class="isCollapse ? 'only-logo' : ''">
                    <span v-if="!isCollapse">{{ title }}</span>
                </div>
            </header>
            <main flex="auto" min-h-1px>
                <div class="menu-area h-full">
                    <el-scrollbar class="h-full">
                        <global-menu :menu-by-authority="homeMenu" :is-collapse="isCollapse"></global-menu>
                    </el-scrollbar>
                </div>
            </main>
            <footer flex="~ items-center justify-around" mt-20px pb-20px>
                <ElPopover placement="right" :width="150" trigger="click">
                    <template #reference>
                        <div class="chat-menu-item" cursor-pointer>
                            <i class="chat-menu-icon i-lucide-user-round"></i>
                        </div>
                    </template>
                    <ul class="drop-menu">
                        <li class="" flex="~ items-center" cursor-pointer rounded-5px px-10px py-5px @click="handleExit">
                            <el-icon> <SwitchButton /> </el-icon>
                            <span ml-6px>退出登录</span>
                        </li>
                    </ul>
                </ElPopover>
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    :content="isCollapse ? '展开菜单' : '折叠菜单'"
                    placement="bottom"
                >
                    <div class="chat-menu-item" cursor-pointer @click="isCollapse = !isCollapse">
                        <i class="chat-menu-icon" :class="!isCollapse ? 'i-lucide-chevron-first' : 'i-lucide-chevron-last'"></i>
                    </div>
                </el-tooltip>
            </footer>
        </section>
    </aside>
</template>

<script setup lang="ts">
import { SwitchButton } from '@element-plus/icons-vue'
import { clearLoginData } from '~/composables/storage'
import useMenuStore from '~/stores/use-menu-store'

defineOptions({
    name: 'LayoutAside',
})

const isCollapse = ref(false)

const router = useRouter()
function handleExit() {
    clearLoginData()
    router.replace('/login')
}

const menuStore = useMenuStore()
const { menuByAuthority } = storeToRefs(menuStore)

/** 读取后台模块的子菜单 */
const homeMenu = computed(() => {
    // return menuByAuthority.value.find(item => item.showName === backendName)?.subMenuList || []
    return menuByAuthority.value || []
})

const title = ref('认知大模型正式版')
onMounted(() => {
    document.title = title.value
})
</script>
