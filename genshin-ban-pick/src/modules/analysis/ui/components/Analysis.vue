<!-- src/modules/analysis/ui/components/Analysis.vue -->

<script setup lang="ts">
import { ref } from 'vue';

import CharacterClustersChart from './CharacterClustersChart.vue';
import CharacterSynergyChart from './CharacterSynergyChart.vue';
import CharacterTacticalUsagesChart from './CharacterTacticalUsagesChart.vue';
import CharacterTacticalUsageCompositionChart from './CharacterTacticalUsageCompositionChart.vue';
import PlayerCharacterChart from './PlayerCharacterChart.vue';
import PlayerStyleRadarChart from './PlayerStyleRadarChart.vue';
import CharacterSynergyGraphChart from './CharacterSynergyGraphChart.vue';

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const tabs = [
    { name: '玩家風格雷達', component: PlayerStyleRadarChart },
    { name: '角色使用權重', component: CharacterTacticalUsagesChart },
    { name: '角色使用構成', component: CharacterTacticalUsageCompositionChart },
    { name: '角色共現熱圖', component: CharacterSynergyChart },
    // { name: '角色圖', component: CharacterSynergyGraphChart },
    { name: '角色群聚圖', component: CharacterClustersChart },

    { name: '玩家偏好角色', component: PlayerCharacterChart },
    
];

const currentTabIndex = ref<number>(0);
</script>

<template>
    <div class="layout__analysis">
        <div class="tab__bar">
            <button v-for="(t, i) in tabs" :key="i" class="tab" :class="{ 'tab--active': currentTabIndex === i }" @click="currentTabIndex = i">
                {{ t.name }}
            </button>
        </div>
        <div class="chart__section">
            <component :is="tabs[currentTabIndex].component" />
        </div>
    </div>
</template>

<style scoped>
.layout__analysis {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 90vh;
}

.tab__bar {
    --size-tab: calc(var(--base-size) * 6);
    display: flex;
    flex-direction: column;
    background-color: var(--md-sys-color-surface-container);
    gap: var(--space-lg);
    padding: var(--space-lg) var(--space-md);
    flex-shrink: 1;
    height: 100%;
}

.tab {
    width: var(--size-tab);
    background-color: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
    border: none;
    border-radius: var(--radius-md);
    padding: var(--space-md);
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-sans);
}

.tab:hover {
    transform: scale(1.05);
}

.tab--active {
    background-color: color-mix(in srgb, var(--md-sys-color-surface-container-highest), white 18%);
}

.chart__section {
    width: 100%;
    height: 100%;
    background-color: var(--md-sys-color-surface-dim);
}
</style>
