import type { PermissionObject } from '~/types/components.types'
import { useMenuData } from '~/composables'

/**
 * Mock 模式下的完整按钮权限
 */
function createMockAuth(): PermissionObject {
    return {
        menuId: 'demo-mock',
        children: [],
        READ: true,
        READ_path: '',
        ADD: true,
        ADD_path: '',
        UPDATE: true,
        UPDATE_path: '',
        DELETE: true,
        DELETE_path: '',
        BATCH_DELETE: true,
        BATCH_DELETE_path: '',
    } as unknown as PermissionObject
}

/**
 * 获取示例页权限：Mock 模式下授予完整 CRUD 权限
 */
export function useDemoAuth() {
    const menuData = useMenuData()
    const isMock = import.meta.env.VITE_USE_DEMO_MOCK === 'true'

    const auth = computed<PermissionObject>(() => {
        if (isMock)
            return createMockAuth()
        return menuData.value.auth
    })

    const canRead = computed(() => Boolean(auth.value.READ))

    return {
        auth,
        canRead,
        isMock,
    }
}
