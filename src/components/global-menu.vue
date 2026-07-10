<template>
    <el-menu
        v-if="menuByAuthority.length"
        :key="menuKey"
        class="menu h-full" router
        :default-active="activeMenu" :collapse="isCollapse" :default-openeds="parentIDs"
    >
        <template v-for="item in menuByAuthority" :key="item.menuId">
            <el-menu-item
                v-if="!item.subMenuList.length" :index="`${item.path}`"
                :route="`${item.path}`"
            >
                <template v-if="(route.path === '/404' ? route?.redirectedFrom?.path : route.path) === `${item.path}`">
                    <el-icon v-if="!item.iconSelection" class="menu-icon">
                        <Promotion />
                    </el-icon>
                    <i v-else class="menu-icon el-icon"><img :src="`${assetsUrl}${item.iconSelection}`"></i>
                </template>
                <template v-else>
                    <el-icon v-if="!item.iconShow" class="menu-icon">
                        <Promotion />
                    </el-icon>
                    <i v-else class="menu-icon el-icon"><img :src="`${assetsUrl}${item.iconShow}`"></i>
                </template>
                <template #title>
                    <span>{{ item.showName }}</span>
                </template>
            </el-menu-item>
            <el-sub-menu v-else :index="item.menuId">
                <template #title>
                    <el-icon v-if="!item.iconShow || item.showIcon === 0" class="menu-icon">
                        <Promotion />
                    </el-icon>
                    <i v-else class="menu-icon el-icon"><img :src="`${assetsUrl}${item.iconShow}`"></i>
                    <span>{{ item.showName }}</span>
                </template>
                <el-menu-item
                    v-for="sub_item in item.subMenuList"
                    :key="sub_item.menuId" :index="`${sub_item.path}`"
                    :route="`${sub_item.path}`"
                >
                    <template v-if="(route.path === '/404' ? route?.redirectedFrom?.path : route.path) === `${sub_item.path}`">
                        <el-icon v-if="!sub_item.iconSelection" class="menu-icon">
                            <Promotion />
                        </el-icon>
                        <i v-else class="menu-icon el-icon"><img :src="`${assetsUrl}${sub_item.iconSelection}`"></i>
                    </template>
                    <template v-else>
                        <el-icon v-if="!sub_item.iconShow" class="menu-icon">
                            <Promotion />
                        </el-icon>
                        <i v-else class="menu-icon el-icon"><img :src="`${assetsUrl}${sub_item.iconShow}`"></i>
                    </template>
                    <template #title>
                        <span>{{ sub_item.showName }}</span>
                    </template>
                </el-menu-item>
            </el-sub-menu>
        </template>
    </el-menu>
</template>

<script setup lang="ts">
import type { MenuByAuthorityRoot } from '~/types/menu.types'

import { Promotion } from '@element-plus/icons-vue'
import { assetsUrl } from '~/config'

defineOptions({
    name: 'GlobalMenu',
})

const { menuByAuthority, isCollapse } = defineProps<{
    menuByAuthority: MenuByAuthorityRoot[]
    isCollapse: boolean
}>()

const parentIDs = computed(() => {
    return menuByAuthority.map((item) => {
        if (item.subMenuList.length) {
            return item.menuId
        }
        return ''
    }).filter(item => item !== '')
})

const menuKey = ref(0)
// 监听折叠状态，展开时改变 key 值触发组件重构
watch(() => isCollapse, (collapsed) => {
    if (!collapsed) {
        menuKey.value++ // 关键点：key 改变，el-menu 会重新初始化并读取 default-openeds
    }
})

const route = useRoute()

const activeMenu = computed(() => {
    const { meta, path } = route
    return meta.activeMenu || path
})
</script>
