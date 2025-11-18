<!-- src/features/Analysis/components/CharacterTacticalUsagesChart.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { useCharacterTacticalUsagesChart } from './composables/useCharacterTacticalUsagesChart';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { option } = useCharacterTacticalUsagesChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <h2>角色使用權重分析</h2>
            <p class="chart-desc">綜合全期平均與有效期表現，平衡穩定性與即戰力。</p>
        </header>
        <div class="chart">
            <VChart v-if="option" :option="option" />
        </div>
        <footer class="chart__footer">
            <small>
                每場比賽依動作類型（Wc）給予權重，隨機（Random）行動或未使用（Not Used）時會降權。<br />
                GlobalUsage = AllMatches / Wc​, EffectiveUsage = ValidMatches / Wc<br />
                StabilityFactor = 1 − e ^ (−30 / ValidMatches)​<br />
                TacticalUsage​ = GlobalUsage × StabilityFactor + EffectiveUsage × (1 − StabilityFactor)
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
