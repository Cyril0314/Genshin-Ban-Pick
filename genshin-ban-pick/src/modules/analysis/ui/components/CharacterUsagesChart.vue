<!-- src/modules/analysis/ui/components/CharacterUsagesChart.vue.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { useCharacterUsagesChart } from '../composables/useCharacterUsagesChart';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { option } = useCharacterUsagesChart();
</script>

<template>
    <div class="chart">
        <header class="header">
            <div class="title">
                <h2>角色使用權重分析</h2>
                <p class="desc">綜合全期平均與有效期表現，平衡穩定性與即戰力。</p>
            </div>
        </header>
        <div class="canvas">
            <VChart v-if="option" :option="option" />
        </div>
        <footer class="footer">
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
