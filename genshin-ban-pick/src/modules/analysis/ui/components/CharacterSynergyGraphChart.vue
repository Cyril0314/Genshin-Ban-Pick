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
    <div class="chart">
        <header class="header">
            <div class="title">
                <h2>角色圖</h2>
                <p class="chart-desc">。</p>
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

