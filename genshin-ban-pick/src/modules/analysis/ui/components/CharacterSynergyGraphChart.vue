<script setup lang="ts">
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GraphChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';

import { useCharacterSynergyGraphChart } from '../composables/useCharacterSynergyGraphChart';

use([CanvasRenderer, GraphChart, LegendComponent, TooltipComponent, DataZoomComponent]);

const props = defineProps<{}>();
const emit = defineEmits<{}>();

const { option } = useCharacterSynergyGraphChart();

</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>角色圖</h2>
                <p class="chart-desc">。</p>
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

