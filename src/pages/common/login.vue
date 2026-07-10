<template>
    <section class="w-full h-full login-bg">
        <div class="w-full h-full login-box">
            <div class="login-area">
                <div>
                    <img src="@/assets/images/logo/backend-icon.png" class="w-120px h-130px" alt="">
                </div>
                <div class="tracking-3px text-30px lh-42px font-600 mt-40px mb-44px base-draken-color">{{ appInfo?.appName }}</div>
                <div class="login-panel">
                    <div class="login-item gutter">
                        <el-input v-model="user" class="w-full user" placeholder="请输入用户名" clearable @keyup.enter="handleLogin">
                            <template #prefix>
                                <div class="user-icon i-mdi-account"></div>
                            </template>
                        </el-input>
                    </div>
                    <div class="login-item">
                        <el-input
                            v-model="password"
                            type="password"
                            class="w-full psd" placeholder="请输入密码" clearable show-password
                            @keyup.enter="handleLogin"
                        >
                            <template #prefix>
                                <div class="pwd-icon i-mdi-lock"></div>
                            </template>
                        </el-input>
                    </div>
                    <div class="login-item" flex="~ justify-between items-center" mb-50px mt-26px>
                        <div class="reset-password base-color" cursor-pointer text-14px font-500>
                            忘记密码？
                        </div>
                        <div class="rember-password">
                            <el-checkbox v-model="isRember" @change="onPasswordChange">记住密码</el-checkbox>
                        </div>
                    </div>
                    <div class="w-full">
                        <el-button type="primary" class="w-full btn" :disabled="!user || !password" @click="handleLogin">登&emsp;录</el-button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { CheckboxValueType } from 'element-plus'

import type { UserInfo } from '~/types/login.types'
import { decryptAES, encryptAES } from '~/composables/crypto'
import { $api, getToken } from '~/composables/fetch'
import { loginDataStorage, passwordStorage, remberStorage, tokenStorage, userIdStorage, userNameStorage, userStorage } from '~/composables/storage'
import { loginApi } from '~/config/api'
import { ElMessageBox } from '~/config/element'
import useAppInfoStore from '~/stores/use-app-info-store'
import useMenuStore from '~/stores/use-menu-store'
import useUserStore from '~/stores/use-user-store'

defineOptions({
    name: 'Login',
})

const appInfoStore = useAppInfoStore()
const menuStore = useMenuStore()
const userStore = useUserStore()

const { appInfo } = storeToRefs(appInfoStore)

const user = ref<string>('')
const password = ref<string>('')
const isRember = ref(false)
const router = useRouter()
const route = useRoute()

if (import.meta.env.DEV) {
    user.value = 'lcy'
    password.value = 'Tk654321'
}

const token = getToken()
if (token.token && token.userId) {
    router.replace('/')
}

function onPasswordChange(val: CheckboxValueType) {
    if (val) {
        ElMessageBox.confirm('请确认当前电脑环境安全, 否则记住密码可能导致密码泄露, 确认记住密码吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            showClose: false,
            buttonSize: 'small',
            callback: (btn: string) => {
                if (btn === 'cancel') {
                    isRember.value = false
                }
            },
        })
    }
}

const unwatch = watch(() => tokenStorage.value, async () => {
    if (tokenStorage.value) {
        const redirect = (route.query.redirect as string) || '/'
        await router.replace(redirect)
    }
})

async function handleLogin() {
    if (!user.value || !password.value) {
        return false
    }
    const { result } = await $api.post<UserInfo>(loginApi, { loginName: user.value, password: password.value })
    if (result) {
        if (isRember.value) {
            result.password = encryptAES(password.value, user.value)
            userStorage.value = user.value
            passwordStorage.value = encryptAES(password.value, user.value)
            remberStorage.value = isRember.value
        }
        else {
            result.password = ''
            userStorage.value = ''
            passwordStorage.value = ''
            remberStorage.value = false
        }

        unwatch()
        loginDataStorage.value = result
        userIdStorage.value = result.userId
        userNameStorage.value = result.userName
        tokenStorage.value = result.token

        userStore.setUserInfo(result)

        await Promise.all([
            menuStore.getMenuByAuthority(),
            menuStore.getButtonAuthority(),
        ])
        router.replace('/')
    }
}
onBeforeMount(() => {
    if (remberStorage.value) {
        user.value = userStorage.value
        password.value = decryptAES(passwordStorage.value, userStorage.value)
        isRember.value = remberStorage.value
    }
})
</script>
