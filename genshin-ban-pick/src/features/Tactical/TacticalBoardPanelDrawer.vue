<!-- TacticalBoardPanelDrawer.vue -->
<script setup lang="ts">
import TacticalBoardPanel from './TacticalBoardPanel.vue';

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
        content-style="background-color: var(--md-sys-color-surface-container-low); --base-size: 1.2vw;"
    >
        <!-- <n-drawer-content title="123456">
            <div class="layout__panel">
                <TacticalBoardPanel v-if="teamInfoPair" :teamInfoPair="teamInfoPair" />
            </div>
        </n-drawer-content> -->
        <div class="layout__panel">
            <TacticalBoardPanel />
        </div>
    </n-drawer>
</template>

<style scoped>
.drawer {
    background-color: var(--md-sys-color-primary-container);
}

.layout__panel {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: var(--space-lg);
}

</style>
