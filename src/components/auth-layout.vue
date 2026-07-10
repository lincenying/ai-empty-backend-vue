<template>
    <div class="">
        <el-empty v-if="!props.auth" description="无权限访问" />
        <template v-else>
            <slot></slot>
        </template>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'AuthLayout',
})

const props = defineProps<{
    auth: boolean
}>()
</script>
