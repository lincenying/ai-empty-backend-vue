import type { ConfigEnv } from 'vite'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import UnoCSS from 'unocss/vite'
import { defineConfig, loadEnv } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Progress from 'vite-plugin-progress'

import Build, { outDir } from './vite.config.build'
import Components from './vite.config.components'
import Css from './vite.config.css'
import Macros from './vite.config.macros'

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
    const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)))
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    console.log(`当前编译环境: ${env.VITE_APP_ENV}`)

    return {
        base: './',
        server: Build.server,
        build: Build.build,
        css: Css,
        plugins: [
            ...Macros(),
            ...Components(),
            UnoCSS(),
            /**
             * 打包时展示进度条的插件
             * @see https://github.com/jeddygong/vite-plugin-progress/blob/main/README.zh-CN.md
             */
            Progress(),
            ...(mode === 'development' ? [
                /**
                 * 检查Vite插件的中间状态
                 * @see https://github.com/antfu/vite-plugin-inspect#readme
                 */
                Inspect(),
            ] : [
                {
                    name: 'generate-timestamp',
                    closeBundle() {
                        const buildInfo = {
                            buildTime: new Date().toISOString(),
                            timestamp: Date.now(),
                            buildMode: env.VITE_APP_ENV || 'production',
                            outDir,
                        }

                        const content = JSON.stringify(buildInfo, null, 2)
                        const outputPath = path.resolve(__dirname, outDir, 'timestamp.json')

                        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
                        fs.writeFileSync(outputPath, content)
                        console.log(`时间戳文件已生成: ${outputPath}`)
                    },
                },
            ]),
        ],
        resolve: {
            alias: {
                '~': path.join(__dirname, './src'),
                '@': path.join(__dirname, './src'),
            },
        },
        optimizeDeps: {
            exclude: ['markdown-it', 'pdf.js'],
        },
    }
})
