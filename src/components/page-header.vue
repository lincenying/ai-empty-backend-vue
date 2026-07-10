<template>
    <div class="global-header-box">
        <div class="header-left" flex-col>
            <div class="flex--c gap-10px">
                <span h-14px w-4px rounded-2px class="bg-base-color"></span>
                <p class="text-16px font-600 base-draken-color">{{ pageTitle }}</p>
            </div>
            <div v-if="subTitle" class="text-10px text-hex-B3B3B3 mt-5px">
                {{ subTitle }}
            </div>
        </div>
        <div class="header-right">
            <slot name="right" />
        </div>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: 'PageHeader',
})

const props = defineProps<{
    title: string
    subTitle?: string
}>()

const pageTitle = computed(() => props.title)
</script>
