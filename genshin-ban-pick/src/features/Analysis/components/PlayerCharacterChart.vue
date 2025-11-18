<!-- src/features/Analysis/components/CharacterBanPickUtilityStatsChart.vue -->


<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { HeatmapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent } from 'echarts/components';
import { usePlayerCharacterChart } from './composables/usePlayerCharacterChart';

use([CanvasRenderer, HeatmapChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { option } = usePlayerCharacterChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>玩家偏好角色</h2>
                <p class="chart-desc">本圖顯示玩家偏好使用角色，x軸則是角色使用頻率從高到低</p>
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
