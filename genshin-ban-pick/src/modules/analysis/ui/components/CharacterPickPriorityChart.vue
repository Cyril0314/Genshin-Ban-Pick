<!-- src/modules/analysis/ui/components/CharacterPickPriorityChart.vue -->

<script setup lang="ts">
import { ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { useCharacterPickPriorityChart } from '../composables/useCharacterPickPriorityChart';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent]);

const props = defineProps<{}>();

const { option } = useCharacterPickPriorityChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <h2>搶角優先級分析 (Pick Priority)</h2>
            <p class="chart-desc">分析角色在BP過程中的被選擇順位。優先級越高代表玩家越急著根據場合搶下該角色。</p>
        </header>
        <div class="chart">
            <VChart v-if="option" :option="option" autoresize />
        </div>
        <footer class="chart__footer">
            <small>
                ※ 計算方式：排除隨機(Random)與Utility/Ban場次，計算角色被Pick時的相對順位 (0=首選, 100=尾選)。<br />
                ※ 柱狀圖長度代表「優先度分數 (1 - 相對順位)」，越長代表越常在第一時間被搶下。<br />
                ※ 標籤數值為「平均相對順位百分比」，越低代表越優先。
            </small>
        </footer>
    </div>
</template>

<style scoped>
.layout__chart {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chart__header {
    display: flex;
    flex-direction: column;
    padding: var(--space-md);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.chart-desc {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
    margin-top: var(--space-xs);
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
