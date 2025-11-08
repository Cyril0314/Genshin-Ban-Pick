<!-- src/features/Analysis/Analysis.vue -->

<script setup lang="ts">
import { ref } from 'vue';

import CharacterBanPickUtilityStatsChart from './components/CharacterBanPickUtilityStatsChart.vue';
import CharacterArchetypeMap from './components/CharacterArchetypeMapChart.vue';
import CharacterSynergyChart from './components/CharacterSynergyChart.vue';

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const testChart = {
    xAxis: { type: 'category', data: ['A', 'B', 'C'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [12, 20, 8] }],
};

const tabs = [
    { name: '角色Meta', component: CharacterBanPickUtilityStatsChart },
    { name: '角色原型圖', component: CharacterArchetypeMap },
    { name: '角色共現熱圖', component: CharacterSynergyChart },
    // { name: '角色出場頻率', component: CharacterUsageChart },
    // { name: '隊伍 Archetype 雷達圖', component: TeamArchetypeRadar },
];

const currentTabIndex = ref<number>(0);
</script>

<template>
    <div class="layout">
        <div class="tab__bar">
            <button v-for="(t, i) in tabs" :key="i" class="tab" :class="{ 'tab--active': currentTabIndex === i }" @click="currentTabIndex = i">
                {{ t.name }}
            </button>
        </div>
        <div class="chart__section">
            <component :is="tabs[currentTabIndex].component" />
        </div>
    </div>
    <!-- <VChart :option="testChart" style="width:100%; height:500px;" /> -->
</template>

<style scoped>
.layout {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 90vh;
}

.tab__bar {
    --size-tab: calc(var(--base-size) * 8);

    display: flex;
    flex-direction: column;
    background: var(--md-sys-color-surface-container-highest-alpha);
    gap: var(--space-lg);
    padding: var(--space-lg);
    flex-shrink: 1;
    height: 100%;
}


.tab {
    width: var(--size-tab);
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border: none;
    border-radius: var(--border-radius-sm);
    padding: var(--space-lg);
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    box-shadow: var(--box-shadow);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-sans);
}

.tab:hover {
    background-color: var(--md-sys-color-primary-container);
    transform: scale(1.05);
}

.tab--active {
    transform: scale(0.98);
}

.chart__section {
    width: 100%;
    height: 100%;
}
</style>
