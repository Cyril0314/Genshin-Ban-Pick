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
    <div class="chart">
        <header class="header">
            <div class="title">
                <h2>搶角優先級分析</h2>
                <p class="desc">分析角色在BP過程中的被選擇順位。優先級越高代表玩家越急著根據場合搶下該角色。</p>
            </div>
        </header>
        <div class="canvas">
            <VChart v-if="option" :option="option" autoresize />
        </div>
        <footer class="footer">
            <small>
                ※ 計算方式：排除隨機(Random)與Utility/Ban場次，計算角色被Pick時的相對順位 (0=首選, 100=尾選)。<br />
                ※ 柱狀圖長度代表「優先度分數 (1 - 相對順位)」，越長代表越常在第一時間被搶下。<br />
                ※ 標籤數值為「平均相對順位百分比」，越低代表越優先。
            </small>
        </footer>
    </div>
</template>

<style scoped>
.chart {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: var(--space-sm);
}

.title {
    display: flex;
    flex-direction: column;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    gap: var(--space-sm);
}

.desc {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.canvas {
    display: flex;
    width: 100%;
    height: 100%;
}

.footer {
    display: flex;
    color: var(--md-sys-color-on-surface-variant);
    padding: var(--space-md);
    font-size: var(--font-size-md);
}
</style>
