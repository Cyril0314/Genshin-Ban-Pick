<!-- src/modules/analysis/ui/components/MatchOverviewChart.vue.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent, MarkAreaComponent } from 'echarts/components';
import { useMatchOverviewChart } from '../composables/useMatchOverviewChart';

use([
    CanvasRenderer,
    LineChart,
    ScatterChart,
    GridComponent,
    TooltipComponent,
    VisualMapComponent,
    LegendComponent,
    DataZoomComponent,
    MarkAreaComponent,
]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { option, overview } = useMatchOverviewChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>總覽</h2>
                <p class="chart__desc">顯示全部遊玩場次的統計資料。</p>
            </div>
        </header>
        <div class="overview" v-if="overview">
            <div class="stats__grid">
                <div class="stat__card">
                    <span class="stat__label">總遊玩局數</span>
                    <span class="stat__value">{{ overview.volume.matchCount }} <small>次</small></span>
                </div>

                <div class="stat__card">
                    <span class="stat__label">總玩家數</span>
                    <span class="stat__value">{{ overview.volume.player.total }} <small>人</small></span>
                    <div class="stat__breakdown">
                        <span title="會員">會員 {{ overview.volume.player.member }}</span>
                        <span title="訪客">訪客 {{ overview.volume.player.guest }}</span>
                        <span title="僅名稱">僅名稱 {{ overview.volume.player.onlyName }}</span>
                    </div>
                </div>

                <div class="stat__card">
                    <span class="stat__label">出場角色數</span>
                    <span class="stat__value">{{ overview.volume.characterCount }} <small>名</small></span>
                </div>

                <div class="stat__card">
                    <span class="stat__label">總移動次數</span>
                    <span class="stat__value">{{ overview.volume.moves.total }} <small>次</small></span>
                    <div class="stat__breakdown">
                        <span title="Ban">Ban {{ overview.volume.moves.byType.ban }}</span>
                        <span title="Pick">Pick {{ overview.volume.moves.byType.pick }}</span>
                        <span title="Utility">Utility {{ overview.volume.moves.byType.utility }}</span>
                    </div>
                    <div class="stat__breakdown">
                        <span title="手動">手動 {{ overview.volume.moves.bySource.manual }}</span>
                        <span title="隨機">隨機 {{ overview.volume.moves.bySource.random }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="chart">
            <VChart v-if="option" :option="option" />
        </div>
        <footer class="chart__footer">
            <template v-if="overview"
                ><small
                    >資料區間: {{ new Date(overview.activity.earliestMatchAt).toLocaleDateString() }} -
                    {{ new Date(overview.activity.latestMatchAt).toLocaleDateString() }}</small
                ></template
            >
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

.overview {
    display: flex;
    flex-direction: column;
    padding: var(--space-sm);
}

/* 網格佈局 */
.stats__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-md);
}

.stat__card {
    background: var(--md-sys-color-surface-container-high);
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.stat__label {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.stat__value {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-primary);
}

.stat__value small {
    font-size: var(--font-size-sm);
    font-weight: normal;
    margin-left: 2px;
}

/* 玩家組成細項 */
.stat__breakdown {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-xs);
    font-size: 12px;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    padding-top: var(--space-xs);
    color: var(--md-sys-color-on-surface-variant);
}

.chart {
    display: flex;
    width: 100%;
    height: 20%;
}

.chart__footer {
    display: flex;
    color: var(--md-sys-color-on-surface-variant);
    padding: var(--space-md);
    font-size: var(--font-size-md);
}
</style>
