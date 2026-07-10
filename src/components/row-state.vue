<template>
    <span class="row-state" :class="data.className">
        {{ data.label || type }}
        <slot></slot>
    </span>
</template>

<script setup lang="ts">
import type { LabelValue } from '~/types/global.types'
import { getArrState } from '~/utils'

defineOptions({
    name: 'RowState',
})

const props = defineProps<{
    stateOpts: LabelValue[]
    type?: string | number | boolean | null
}>()

const { stateOpts, type } = toRefs(props)

const data = computed(() => {
    return getArrState(stateOpts.value, type.value ?? '')
})
</script>
