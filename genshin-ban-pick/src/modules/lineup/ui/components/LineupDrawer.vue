<!-- src/modules/lineup/ui/components/LineupDrawer.vue -->

<script setup lang="ts">
import Lineup from './Lineup.vue';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();
</script>

<template>
    <n-drawer
        class="drawer"
        :show="props.open"
        @update:show="emit('update:open', $event)"
        placement="right"
        width="undefined"
        content-class="scale-context"
        content-style="background-color: var(--md-sys-color-surface-container-high); --base-size: 1.2vw;"
    >
        <Lineup />
    </n-drawer>
</template>

<style scoped>
</style>
