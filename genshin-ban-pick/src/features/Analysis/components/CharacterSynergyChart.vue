<!-- src/features/Analysis/components/CharacterSynergyChart.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { HeatmapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { useCharacterSynergyChart } from './composables/useCharacterSynergyChart';

use([CanvasRenderer, HeatmapChart, GridComponent, TooltipComponent, VisualMapComponent]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { scope, option } = useCharacterSynergyChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>角色共現熱圖</h2>
                <p class="chart-desc">本圖顯示角色間的共現頻率矩陣。顏色越深代表兩個角色越常在同一配置中同時出現。可切換分析範圍（同場 / 同組 / 同隊）以觀察角色之間的搭配傾向。</p>
            </div>
            <div class="chart__modes">
                <span class="chart-mode__text">範圍：</span>
                <select v-model="scope" class="chart-mode__select" :class="['chart-mode__select--' + (scope),]">
                    <option value="match">同場</option>
                    <option value="team">同組</option>
                    <option value="setup">同隊</option>
                </select>
            </div>
        </header>
        <div class="chart">
            <VChart v-if="option" :option="option" />
        </div>

        <footer class="chart__footer">
            <small>

            </small>
        </footer>
    </div>
</template>

<style scoped>
.layout__chart {
    --size-chart-select: calc(var(--base-size) * 3);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chart__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: var(--space-md);
}

.chart__title {
    display: flex;
    flex-direction: column;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.chart__modes {
    display: flex;
    flex-direction: row;
    align-items: top;
    height: fit-content;
    gap: var(--space-sm);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.chart-mode__text {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.chart-mode__select {
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-high);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    width: var(--size-chart-select);
    border: none;
    border-radius: var(--border-radius-xs);
    align-items: center;
    justify-content: center;
    outline: none;
}

.chart-mode__select:focus {
    outline: none;
}

.chart-mode__select:hover {
    transform: scale(1.05);
}

.chart {
    display: flex;
    width: 100%;
    height: 100%;
}

.chart__footer {
    display: flex;
    color: var(--md-sys-color-on-surface-variant);
    padding: var(--space-md);
    font-size: var(--font-size-md);
}

</style>
