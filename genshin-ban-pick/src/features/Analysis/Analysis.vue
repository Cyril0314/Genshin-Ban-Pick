<!-- src/features/Analysis/Analysis.vue -->

<script setup lang="ts">
import { ref } from 'vue';

import CharacterBanPickUtilityStatsChart from './components/CharacterBanPickUtilityStatsChart.vue';
import CharacterArchetypeMapChart from './components/CharacterArchetypeMapChart.vue';
import CharacterSynergyChart from './components/CharacterSynergyChart.vue';
import CharacterTacticalUsagesChart from './components/CharacterTacticalUsagesChart.vue';

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const tabs = [
    { name: '角色使用權重', component: CharacterTacticalUsagesChart },
    { name: '角色Meta', component: CharacterBanPickUtilityStatsChart },
    { name: '角色原型圖', component: CharacterArchetypeMapChart },
    { name: '角色共現熱圖', component: CharacterSynergyChart },
    // { name: '角色出場頻率', component: CharacterUsageChart },
    // { name: '隊伍 Archetype 雷達圖', component: TeamArchetypeRadar },
];

const currentTabIndex = ref<number>(0);
</script>

<template>
    <div class="layout">
        <div class="tab__bar">
            <button v-for="(t, i) in tabs" :key="i" class="tab" :class="{ 'tab--active': currentTabIndex === i }"
                @click="currentTabIndex = i">
                {{ t.name }}
            </button>
        </div>
        <div class="chart__section">
            <component :is="tabs[currentTabIndex].component" />
        </div>
    </div>
</template>

<style scoped>
.layout {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 90vh;
    background: var(--md-sys-color-surface);
}

.tab__bar {
    --size-tab: calc(var(--base-size) * 6);

    display: flex;
    flex-direction: column;
    background: var(--md-sys-color-surface-container-low);
    gap: var(--space-lg);
    padding: var(--space-lg) var(--space-md);
    flex-shrink: 1;
    height: 100%;
}


.tab {
    width: var(--size-tab);
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border: none;
    border-radius: var(--border-radius-sm);
    padding: var(--space-md);
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    box-shadow: var(--box-shadow);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-sans);
}

.tab:hover {
    transform: scale(1.05);
}

.tab--active {
    background: var(--md-sys-color-on-primary);
    color: var(--md-sys-color-primary);
    transform: scale(0.98);
}

.chart__section {
    width: 100%;
    height: 100%;
    
}
</style>
