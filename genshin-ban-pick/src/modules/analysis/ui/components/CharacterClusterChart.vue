<!-- src/modules/analysis/ui/components/CharacterClusterChart.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent } from 'echarts/components';
import { useCharacterClusterChart } from '../composables/useCharacterClusterChart';

use([CanvasRenderer, ScatterChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent]);

const props = defineProps<{}>();
const emit = defineEmits<{}>();

const { option } = useCharacterClusterChart()

</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>角色群聚圖</h2>
                <p class="chart__desc">不同顏色代表角色所屬的組隊原型群。點的位置顯示他們在組隊上的頻繁程度，點越大代表該角色在比賽中被採用得越頻繁。群中心表示該群中最典型「代表該玩法」的角色。有白框表示為邊界角色適配多種隊伍</p>
            </div>
            <div class="chart__modes">
                <!-- <span class="chart-mode__text">範圍：</span> -->
                <!-- <select v-model="scope" class="chart-mode__select" :class="['chart-mode__select--' + (scope),]">
                    <option value="match">同場</option>
                    <option value="team">同組</option>
                    <option value="setup">同隊</option>
                </select> -->
            </div>
        </header>
        <div class="chart">
            <VChart v-if="option" :option="option" />
        </div>

        <footer class="chart__footer">
            <small>
                本圖透過角色間共現關係（Synergy Matrix）計算特徵向量，
                經 PCA 降維後以 k-means 聚類劃分角色原型。
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
    padding: var(--space-sm);
}

.chart__title {
    display: flex;
    flex-direction: column;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    gap: var(--space-sm);
}

.chart__desc {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.chart__modes {
    display: flex;
    flex-direction: row;
    align-items: top;
    height: fit-content;
    gap: var(--space-md);
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
    border-radius: var(--radius-md);
    
    align-items: center;
    text-align: center;
    justify-content: center;
    outline: none;
    border: none;
}

.chart-mode__select:focus {
    outline: none;
    border: none;
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
