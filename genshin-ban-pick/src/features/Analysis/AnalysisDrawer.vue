<!-- src/features/Analysis/AnalysisDrawer.vue -->

<script setup lang="ts">
import Analysis from './Analysis.vue';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();
</script>

<template>
    <n-drawer class="drawer" :show="props.open" @update:show="emit('update:open', $event)" placement="bottom" height="undefined" content-class="scale-context"
        content-style="background-color: var(--md-sys-color-surface-container-low); --base-size: 1.2vw;">
        <div class="layout">
            <Analysis />
        </div>
    </n-drawer>
</template>

<style scoped>
.drawer {
    background-color: var(--md-sys-color-primary-container);
}

.layout {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: var(--space-lg);
}
</style>
