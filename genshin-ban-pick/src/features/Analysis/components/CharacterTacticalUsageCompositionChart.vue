<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { useCharacterTacticalUsageCompositionChart } from './composables/useCharacterTacticalUsageCompositionChart';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { isPercentage, activeType, option } = useCharacterTacticalUsageCompositionChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>角色使用組成分析</h2>
                <p class="chart-desc">每個橫條代表角色的行為組成。可切換為顯示比例或次數，觀察角色在 Ban / Pick / Utility 階段的出場特性。</p>
            </div>
            <div class="chart__modes">
                <span class="chart-mode__text">顯示模式：</span>
                <button class="chart-mode__switch" :class="[{ 'chart-mode__switch--percentage': isPercentage },]"
                    @click="isPercentage = !isPercentage">
                    {{ isPercentage ? '比例 (%)' : '絕對值 (次數)' }}
                </button>
                <select v-model="activeType" class="chart-mode__select" :class="['chart-mode__select--' + (activeType),]">
                    <option value="All">All</option>
                    <option value="Pick">Pick</option>
                    <option value="Ban">Ban</option>
                    <option value="Utility">Utility</option>
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
    --size-chart-switch: calc(var(--base-size) * 6);
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

.chart-mode__switch {
    font-size: var(--font-size-md);
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-high);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--box-shadow);
    width: var(--size-chart-switch);
    border: none;
    border-radius: var(--border-radius-xs);
    align-items: center;
    justify-content: center;
}

.chart-mode__switch:hover {
    transform: scale(1.05);
}

.chart-mode__switch--percentage {
    
}

.chart-mode__select {
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-high);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--box-shadow);
    width: var(--size-chart-select);
    border: none;
    border-radius: var(--border-radius-xs);
    align-items: center;
    justify-content: center;
    outline: none;
}

.chart-mode__select:focus {
    outline: none;
    box-shadow: none;
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
    padding: var(--space-sm);
    font-size: var(--font-size-md);
}
</style>
