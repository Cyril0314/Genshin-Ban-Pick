<script setup lang="ts">
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { SunburstChart, TreemapChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { UniversalTransition } from 'echarts/features';
import AttributeLayerPicker from './AttributeLayerPicker.vue';
import { useCharacterAttributeDistributionsChart } from '../composables/useCharacterAttributeDistributionsChart';

// UniversalTransition：sunburst ↔ treemap 切換時的元素級 morph 動畫
use([CanvasRenderer, SunburstChart, TreemapChart, TooltipComponent, UniversalTransition]);

const { option, selectedLayers, layerOptions, chartType } = useCharacterAttributeDistributionsChart();
</script>

<template>
    <div class="chart">
        <div class="section">
            <header class="header">
                <div class="title">
                    <h2>角色屬性分布</h2>
                    <p class="desc">全體玩家在對局中的角色選擇。自訂由內到外的屬性層級（最少一層、最多六層），最外圈為角色；點圈可下鑽。</p>
                </div>
            </header>
            <div class="type-toggle" role="group">
                <button class="type-btn" :class="{ 'is-active': chartType === 'sunburst' }" @click="chartType = 'sunburst'">旭日圖</button>
                <button class="type-btn" :class="{ 'is-active': chartType === 'treemap' }" @click="chartType = 'treemap'">矩形樹圖</button>
            </div>

            <AttributeLayerPicker class="picker" v-model="selectedLayers" :options="layerOptions" />
        </div>

        <div class="canvas">
            <!-- notMerge:false（merge）讓 universalTransition 有前後連續性，切換才會 morph -->
            <VChart v-if="option" class="viz" :option="option" :update-options="{ notMerge: false }" autoresize />
            <div v-else class="empty">尚無足夠資料進行分析</div>
        </div>
    </div>
</template>

<style scoped>
.chart {
    display: flex;
    flex-direction: row;
    height: 100%;

}

.section {
    display: flex;
    flex-direction: column;
    width: 35%;
    gap: var(--space-lg);
    padding: var(--space-sm);
}

.header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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

.type-toggle {
    display: inline-flex;
    align-self: flex-start;
    gap: 1px;
    padding: var(--space-xxs);
    border-radius: var(--radius-md);
    background-color: var(--md-sys-color-surface-container-low);
}

.type-btn {
    padding: var(--space-xxs) var(--space-md);
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
    cursor: pointer;
}

.type-btn.is-active {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
}

.picker {
    width: 100%;
    flex: 1;
}

.canvas {
    display: flex;
    flex: 1;
    width: 100%;
    min-height: 0;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    padding: var(--space-sm);
}

.viz {
    width: 100%;
    height: 100%;
    min-height: 0;
}

.empty {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-md);
}
</style>
