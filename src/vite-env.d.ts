interface ViteTypeOptions {
    // 添加这行代码，你就可以将 ImportMetaEnv 的类型设为严格模式，
    // 这样就不允许有未知的键值了。
    // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
    readonly ENV: string
    readonly VITE_APP_ENV: string
    readonly VITE_ASSETS_BASE_URL: string
    readonly VITE_BASE_API: string
    readonly VITE_ASSETS_URL: string
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_VERSION: string
    readonly VITE_USE_DEMO_MOCK: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
