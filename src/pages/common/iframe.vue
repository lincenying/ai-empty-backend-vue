<template>
    <div flex="~ col" h-full w-full>
        <iframe :src="newUrl" frameborder="0" class="w-full h-full"></iframe>
    </div>
</template>

<script setup lang="ts">
import { decryptAES } from '~/composables/crypto'

defineOptions({
    name: 'ChatIframe',
})

const url = useRouteQuery('url')

const newUrl = computed(() => {
    return decryptAES(decodeURIComponent(url.value as string), 'app')
})
</script>
