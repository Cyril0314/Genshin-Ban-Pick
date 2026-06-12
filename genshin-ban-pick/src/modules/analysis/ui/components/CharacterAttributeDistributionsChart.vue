<script setup lang="ts">
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { useCharacterAttributeDistributionsChart } from '../composables/useCharacterAttributeDistributionsChart';

use([CanvasRenderer, PieChart, TooltipComponent]);

const { donutCharts } = useCharacterAttributeDistributionsChart();
</script>

<template>
    <div class="chart">
        <header class="header">
            <div class="title">
                <h2>角色屬性分布</h2>
                <p class="desc">全體玩家在對局中的角色選擇，依稀有度、元素等屬性的整體分布。</p>
            </div>
        </header>
        <div class="canvas">
            <div v-if="donutCharts.length" class="donut-grid">
                <div v-for="d in donutCharts" :key="d.key" class="donut-cell">
                    <VChart class="donut-chart" :option="d.option" :update-options="{ notMerge: true }" autoresize />
                    <span class="donut-label">{{ d.label }}</span>
                </div>
            </div>
            <div v-else class="empty">尚無足夠數據進行分析</div>
        </div>
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
    min-height: 0;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    padding: var(--space-sm);
}

.donut-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr;
    gap: var(--space-md);
    width: 100%;
    height: 100%;
}

.donut-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    min-height: 0;
    padding: var(--space-sm);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-md);
}

.donut-chart {
    width: 100%;
    height: 100%;
    min-height: 0;
}

.donut-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface-variant);
}

.empty {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-md);
}
</style>
