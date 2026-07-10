import { createRouter, createWebHashHistory } from 'vue-router'
import emitter from '~/composables/emitter'

const history = createWebHashHistory()
const router = createRouter({
    history,
    routes: [
        {
            path: '/',
            name: 'index',
            redirect: '/demo/index',
        },
        {
            path: '/demo/index',
            component: () => import('@/pages/demo/index.vue'),
            name: 'demo-index',
            props: true,
            meta: {
                layout: 'default',
            },
        },
        {
            path: '/iframe',
            component: () => import('@/pages/common/iframe.vue'),
            name: 'iframe-index',
            props: true,
            meta: {
                layout: 'default',
            },
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/pages/common/login.vue'),
            meta: {
                layout: 'common',
                needLogin: false,
            },
        },
        {
            path: '/404',
            name: '404',
            component: () => import('@/pages/common/empty-404.vue'),
            meta: {
                layout: 'common',
                needLogin: false,
            },
        },
        {
            path: '/no-auth',
            name: 'no-auth',
            component: () => import('@/pages/common/no-auth.vue'),
            meta: {
                layout: 'common',
                needLogin: false,
            },
        },
        { path: '/:pathMatch(.*)', redirect: '/404' },
    ],
})

// 路由跳转前的监听操作
router.beforeEach(() => {
    emitter.emit('nprogress-start', 'router')
    return true
})

// 路由跳转后的监听操作
router.afterEach(() => {
    emitter.emit('nprogress-done', 'router')
})

export default router
