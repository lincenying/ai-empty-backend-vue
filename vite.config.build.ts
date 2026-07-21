import type { BuildOptions, ServerOptions } from 'vite'

import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const outDir = '../_build/cbm_v6'

const config: { server: ServerOptions, build: BuildOptions } = {
    server: {
        port: 8055,
        host: '0.0.0.0',
        open: true,
        proxy: {
            // 代理配置
            '/cbm': {
                // target: 'https://39.183.161.132:51281',
                target: 'http://192.168.5.202:58080',
                // target: 'http://192.168.5.210:18101',
                // target: "http://192.168.5.166:18101",
                changeOrigin: true,
                rewrite: path => path.replace(/^\/cbm/, '/cbm'),
                secure: false,
            },
        },
        warmup: {
            clientFiles: ['./src/main.ts', './src/pages/**/*.vue'],
        },
        hmr: {
            port: 59051,
        },
    },
    build: {
        target: 'es2018',
        cssTarget: 'chrome79',
        minify: 'terser',
        assetsInlineLimit: 4096,
        chunkSizeWarningLimit: 1000,
        outDir,
        terserOptions: {
            compress: {
                // 生产环境时移除console
                drop_console: process.env.VITE_APP_ENV === 'production',
                drop_debugger: process.env.VITE_APP_ENV === 'production',
            },
        },
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            },
            external: /static\/.*?\.[cm]*js/,
            output: {
                manualChunks(id: string) {
                    // 处理js/css分块
                    if (id.includes('node_modules')) {
                        if (id.includes('element-plus')) {
                            return 'element-plus'
                        }
                        else if (id.includes('@vue-office')) {
                            return 'vue-office'
                        }
                        return 'vendor'
                    }
                    if (id.includes('__uno.css')) {
                        return 'unocss'
                    }
                    //     // 处理js分块
                    //     if (id.includes('.js') || id.includes('.mjs') || id.includes('.cjs')) {
                    //         if (id.includes('node_modules'))
                    //             return 'vendor'
                    //         return 'main'
                    //     }
                },
            },
        },
    },
}

export default config
