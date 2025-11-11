<!-- src/features/Analysis/components/CharacterTacticalUsagesChart.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { useCharacterTacticalUsageStats } from './composables/useTacticalUsages';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { option } = useCharacterTacticalUsageStats();
</script>

<template>
    <div class="layout__tactical-usages-chart">
        <header class="chart__header">
            <h2>角色戰術使用權重分析</h2>
            <p class="chart-desc">結合角色在比賽中的 <b>有效使用次數</b> 與 <b>全域使用頻率</b>， 綜合反映角色的「穩定上場價值」。</p>
        </header>
        <div class="chart">
            <VChart v-if="option" :option="option" />
        </div>
        <footer class="chart__footer">
            <small>
                綜合使用權重 = 有效使用率 × 穩定係數 + 全域使用率 × (1 - 穩定係數)<br />
                當角色樣本場數少於 10 場時，穩定係數會降低以矯正極端樣本。
            </small>
        </footer>
    </div>
</template>

<style scoped>
.layout__tactical-usages-chart {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chart__header {
    display: flex;
    flex-direction: column;
    padding: var(--space-sm);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.chart {
    display: flex;
    width: 100%;
    /* min-height: 0; */
    height: 100%;
}

.chart__footer {
    display: flex;
    color: var(--md-sys-color-on-surface-variant);
    padding: var(--space-sm);
    font-size: var(--font-size-md);
}
</style>
