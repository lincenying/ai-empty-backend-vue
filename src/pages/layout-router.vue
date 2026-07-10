<template>
    <section class="w-full h-full overflow-hidden main-page">
        <div class="main-page-bg"></div>
        <layout-aside></layout-aside>
        <main class="m-20px ml-0 bg-hex-fff rounded-10px">
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </main>
    </section>
</template>

<script setup lang="ts">
defineOptions({
    name: 'LayoutRouter',
})
</script>
