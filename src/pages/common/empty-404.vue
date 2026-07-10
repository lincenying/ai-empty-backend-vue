<template>
    <div h-full w-full flex="~ col" bg-hex-fff>
        <div class="global-header-box chat">
            <div class="header-left flex--c cursor-pointer" @click="router.push('/')">
                <span h-20px w-20px rounded-2px class="i-mdi-chevron-left bg-base-color"></span>
                <p class="text-16px font-600 base-draken-color">返回</p>
            </div>
        </div>
        <el-empty class="w-full h-full shadow-box" :image-size="120">
            <template #description>
                <div class="text-hex-eae9e9 text-28px">404</div>
            </template>
        </el-empty>
    </div>
</template>

<script setup lang="ts">
const router = useRouter()
</script>
