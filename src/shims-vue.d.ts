declare module '*.vue' {
    import type { DefineComponent } from 'vue'

    const component: DefineComponent<object, object, any>
    export default component
}

declare module '*.scss' {
    const content: Record<string, string>
    export default content
}

export {}

declare module 'vue-router' {
    interface RouteMeta {
        showHeader?: boolean
        needLogin?: boolean
        layout: string
        parentData?: { title: string, url?: string }[]
        activeMenu?: string
        /** 未在菜单树中配置当前 path 时，用于解析按钮权限的菜单 path（如热词页复用问答对菜单） */
        permissionMenuPath?: string
    }
}
