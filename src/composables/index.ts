import type { PermissionObject } from '~/types/components.types'
import useMenuStore from '~/stores/use-menu-store'
import { flattenTree } from '~/utils'

interface MenuDataType {
    menuId: string
    parentId: string
    path: string
    auth: PermissionObject
}

/**
 * 获取菜单数据
 * @returns 菜单数据
 */
export function useMenuData() {
    const route = useRoute()

    const menuStore = useMenuStore()
    const { menuByAuthority } = storeToRefs(menuStore)

    const flattenMenu = computed(() => {
        return flattenTree(menuByAuthority.value || [])
    })

    const menuData = computed<MenuDataType>(() => {
        const data = {
            menuId: '',
            parentId: '',
            path: route.path,
            auth: {} as PermissionObject,
        }
        const flat = flattenMenu.value
        let lookupPath = route.path
        const direct = flat.find(item => item.path === route.path)
        if (!direct) {
            const fb = route.meta.permissionMenuPath
            if (typeof fb === 'string' && flat.some(item => item.path === fb))
                lookupPath = fb
        }
        const obj = flat.find(item => item.path === lookupPath)
        if (obj) {
            data.menuId = obj.menuId
            data.parentId = obj.parentId
            data.auth = menuStore.getButtonAuthorityByMenuId(obj.menuId)
        }
        return data
    })

    return menuData
}
