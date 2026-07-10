<template>
    <section class="w-full h-full overflow-hidden main-page flex-col">
        <div class="main-page-bg"></div>
        <layout-header></layout-header>
        <div class="flex flex-1 min-h-0 overflow-hidden w-full">
            <layout-aside></layout-aside>
            <main class="m-20px ml-0 bg-hex-fff rounded-10px">
                <router-view v-slot="{ Component }">
                    <component :is="Component" />
                </router-view>
            </main>
        </div>
    </section>
</template>

<script setup lang="ts">
defineOptions({
    name: 'LayoutRouter',
})
</script>
