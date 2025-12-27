<script setup lang="ts">
import { ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, MarkLineComponent, MarkAreaComponent } from 'echarts/components';
import { useCharacterScatterChart } from '../composables/useCharacterScatterChart';

use([CanvasRenderer, ScatterChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, MarkLineComponent, MarkAreaComponent]);

const props = defineProps<{}>();

const { option } = useCharacterScatterChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>角色定位象限</h2>
                <p class="chart__desc">透過「泛用度」與「搶角優先級」兩個維度，將角色定位於九個生態象限。</p>
            </div>
        </header>
        <div class="chart">
            <VChart v-if="option" :option="option" autoresize />
        </div>
        <footer class="chart__footer">
            <small>
                分析模型將角色分為九宮格：<br />
                ・<strong>人權 / 強勢 / 奇兵</strong> (高優先)：非 Ban 即選，分為「高泛用核心」、「中堅主力」與「奇兵對策」。<br />
                ・<strong>核心 / 平衡 / 潛力</strong> (中優先)：隊伍中堅力量，根據泛用性區分。<br />
                ・<strong>泛用 / 針對 / 冷門</strong> (低優先)：最後選出的拼圖，包含「補位輔助」、「針對性解」與「待開發角色」。
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
    flex-direction: row;
    justify-content: space-between;
    padding: var(--space-sm);
}

.chart__title {
    display: flex;
    flex-direction: column;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    gap: var(--space-sm);
}

.chart__desc {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
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
