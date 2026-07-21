import NProgress from 'nprogress' // 导入 nprogress模块
import Viewer from 'v-viewer'
import { createApp } from 'vue'

import element from '@/config/element'
import router from '@/router'
import pinia from '@/stores'
import App from './app.vue'

import 'uno.css'
import './assets/font/font.css'
import 'nprogress/nprogress.css'

import 'viewerjs/dist/viewer.css'
import './assets/styles/element/element.scss'
import './assets/styles/style.scss'

// 导入样式，否则看不到效果
NProgress.configure({ easing: 'ease', speed: 200, showSpinner: true })

const app = createApp(App)
// 注入pinia
app.use(pinia)
app.use(element)
app.use(Viewer, {
    defaultOptions: {
        zIndex: 9999,
        inline: true, // 启用 inline 模式
        button: true, // 显示右上角关闭按钮
        navbar: true, // 显示缩略图导航
        title: false, // 显示当前图片的标题
        toolbar: true, // 显示工具栏
        tooltip: true, // 显示缩放百分比
        movable: true, // 图片是否可移动
        zoomable: true, // 图片是否可缩放
        rotatable: true, // 图片是否可旋转
        scalable: true, // 图片是否可翻转
        transition: true, // 使用 CSS3 过度
        fullscreen: false, // 播放时是否全屏
        keyboard: true, // 是否支持键盘
    },
})

app.use(router)
app.mount('#app')
