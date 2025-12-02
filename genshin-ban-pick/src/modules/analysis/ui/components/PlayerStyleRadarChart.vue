<script setup lang="ts">
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { RadarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { usePlayerStyleChart } from '../composables/usePlayerStyleChart';

use([CanvasRenderer, RadarChart, GridComponent, TooltipComponent, LegendComponent]);

const { option } = usePlayerStyleChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>玩家風格雷達圖</h2>
                <p class="chart-desc">本圖顯示玩家在五個維度上的風格傾向：進攻型、防守型、絕活哥、Meta奴、元素偏好。</p>
            </div>
        </header>
        <div class="chart">
            <VChart v-if="option" :option="option" autoresize />
            <div v-else class="chart__empty">尚無足夠數據進行分析</div>
        </div>
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

.chart-desc {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
    margin-top: var(--space-xs);
}

.chart {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
}

.chart__empty {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-md);
}
</style>
