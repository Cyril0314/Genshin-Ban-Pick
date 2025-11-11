<!-- src/features/Analysis/AnalysisDrawer.vue -->

<script setup lang="ts">
import Analysis from './Analysis.vue';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

function handleAfterEnter() {
  // 確保 DOM 全部載入後才聚焦內部元素
  requestAnimationFrame(() => {
    const el = document.querySelector('.drawer .some-focusable') as HTMLElement | null;;
    el?.focus();
  });
}

</script>

<template>
    <n-drawer class="drawer" :show="props.open" @after-enter="handleAfterEnter" @update:show="emit('update:open', $event)" placement="bottom" height="undefined" content-class="scale-context"
        content-style="background-color: var(--md-sys-color-surface-container-low); --base-size: 2.2vh;">
        <div class="layout">
            <Analysis />
        </div>
    </n-drawer>
</template>

<style scoped>
.layout {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}
</style>
