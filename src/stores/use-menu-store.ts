import type { ButtonAuthority, PermissionObject } from '~/types/components.types'
import type { MenuByAuthority, MenuByAuthorityRoot } from '~/types/menu.types'
import type { MenuTreeRoot } from '~/types/role.types'
import { acceptHMRUpdate } from 'pinia'
import { $api } from '~/composables/fetch'
import { getButtonAuthorityApi, getMenuApi } from '~/config/api'

interface MenuState {
    baseDataIsLoaded: number
    buttonAuthority: MenuTreeRoot[]
    menuByAuthority: MenuByAuthorityRoot[]
}

export const useMenuStore = defineStore('userMenuStore', () => {
    const state: MenuState = reactive({
        baseDataIsLoaded: 0,
        buttonAuthority: [],
        menuByAuthority: [],
    })

    /** 获取用户权限菜单的按钮权限 */
    async function getButtonAuthority() {
        const { result } = await $api.post<ButtonAuthority>(getButtonAuthorityApi, {})
        state.buttonAuthority = result?.root ?? []
        state.baseDataIsLoaded++
    }

    function getButtonAuthorityByMenuId(id: string) {
        const obj: Objable = {
            menuId: id,
            children: [],
        }
        state.buttonAuthority.filter(menu => menu.parentId === id).forEach((menu) => {
            if (menu.sign) {
                obj[menu.sign] = true
                obj[`${menu.sign}_path`] = menu.path
            }
            else {
                obj.children.push({
                    menuId: menu.menuId,
                    menuName: menu.menuName,
                    path: menu.path,
                })
            }
        })
        return obj as PermissionObject
    }

    /** 获取用户权限菜单 */
    async function getMenuByAuthority() {
        const { result } = await $api.post<MenuByAuthority>(getMenuApi, { type: '1' })
        state.menuByAuthority = result?.root ?? []
        state.baseDataIsLoaded++
    }

    function getMenuByAuthorityByMenuId(id: string) {
        return state.menuByAuthority.filter(menu => menu.parentId === id)
    }

    return {
        ...toRefs(state),
        getButtonAuthority,
        getButtonAuthorityByMenuId,
        getMenuByAuthority,
        getMenuByAuthorityByMenuId,
    }
})

export default useMenuStore

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMenuStore, import.meta.hot))
}
