<!-- src/modules/analysis/ui/components/CharacterUsagesCompositionChart.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { useCharacterUsagesCompositionChart } from '../composables/useCharacterUsagesCompositionChart';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { isPercentage, activeType, option } = useCharacterUsagesCompositionChart();
</script>

<template>
    <div class="chart">
        <header class="header">
            <div class="title">
                <h2>角色使用組成分析</h2>
                <p class="desc">每個橫條代表角色的行為組成。可切換為顯示比例或次數，觀察角色在 Ban / Pick / Utility 階段的出場特性。</p>
            </div>
            <div class="modes">
                <span class="mode-text">顯示模式：</span>
                <button class="mode-switch" :class="{ 'is-percentage': isPercentage }"
                    @click="isPercentage = !isPercentage">
                    {{ isPercentage ? '比例 (%)' : '絕對值 (次數)' }}
                </button>
                <select v-model="activeType" class="mode-select" :class="['mode-select--' + (activeType),]">
                    <option value="All">All</option>
                    <option value="Pick">Pick</option>
                    <option value="Ban">Ban</option>
                    <option value="Utility">Utility</option>
                </select>
            </div>
        </header>
        <div class="canvas">
            <VChart v-if="option" :option="option" />
        </div>
        <footer class="footer">
            <small>

            </small>
        </footer>
    </div>
</template>

<style scoped>
.chart {
    --size-chart-switch: calc(var(--base-size) * 6);
    --size-chart-select: calc(var(--base-size) * 3);
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

.modes {
    display: flex;
    flex-direction: row;
    align-items: top;
    height: fit-content;
    gap: var(--space-md);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.mode-text {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.mode-switch {
    font-size: var(--font-size-md);
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-high);
    font-weight: var(--font-weight-medium);
    width: var(--size-chart-switch);
    border: none;
    border-radius: var(--radius-md);
    align-items: center;
    justify-content: center;
}

.mode-switch:hover {
    transform: scale(1.05);
}

.mode-switch.is-percentage {

}

.mode-select {
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

.mode-select:focus {
    outline: none;
    border: none;
}

.mode-select:hover {
    transform: scale(1.05);
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
