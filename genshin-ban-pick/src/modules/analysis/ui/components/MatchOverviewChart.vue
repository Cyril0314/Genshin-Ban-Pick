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
                    <span class="stat__value">{{ overview.volume.players.total }} <small>人</small></span>
                    <div class="stat__breakdowns">
                        <div class="stat__breakdown">
                            <span title="會員">會員 {{ overview.volume.players.member }}</span>
                            <span title="訪客">訪客 {{ overview.volume.players.guest }}</span>
                            <span title="僅名稱">僅名稱 {{ overview.volume.players.onlyName }}</span>
                        </div>
                    </div>
                </div>

                <div class="stat__card">
                    <span class="stat__label">出場角色數</span>
                    <span class="stat__value">{{ overview.volume.characters.total }} <small>名</small></span>
                    <div class="stat__breakdowns">
                        <div class="stat__breakdown">
                            <span title="5★">5★ {{ overview.volume.characters.byRarity.fiveStar }}</span>
                            <span title="4★">4★ {{ overview.volume.characters.byRarity.fourStar }}</span>
                        </div>
                        <div class="stat__breakdown">
                            <span title="風">風 {{ overview.volume.characters.byElement.anemo }}</span>
                            <span title="岩">岩 {{ overview.volume.characters.byElement.geo }}</span>
                            <span title="雷">雷 {{ overview.volume.characters.byElement.electro }}</span>
                            <span title="草">草 {{ overview.volume.characters.byElement.dendro }}</span>
                            <span title="水">水 {{ overview.volume.characters.byElement.hydro }}</span>
                            <span title="火">火 {{ overview.volume.characters.byElement.pryo }}</span>
                            <span title="冰">冰 {{ overview.volume.characters.byElement.cryo }}</span>
                            <span title="無">無 {{ overview.volume.characters.byElement.none }}</span>
                        </div>
                    </div>
                </div>

                <div class="stat__card">
                    <span class="stat__label">總移動次數</span>
                    <span class="stat__value">{{ overview.volume.moves.total }} <small>次</small></span>
                    <div class="stat__breakdowns">
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

                <div class="stat__card">
                    <span class="stat__label">橫跨版本數</span>
                    <span class="stat__value">{{ overview.activity.versionSpan.total }} <small>個</small></span>
                    <div class="stat__breakdown">
                        <span title="First">{{ overview.activity.versionSpan.from.name }}</span>
                        <span title="Last">{{ overview.activity.versionSpan.to.name }}</span>
                    </div>
                </div>
                <div class="stat__card">
                    <span class="stat__label">不重複玩家組合數</span>
                    <span class="stat__value">{{ overview.volume.matchTeamMemberCombinationCount }} <small>組</small></span>
                </div>
                <div class="stat__card">
                    <span class="stat__label">不重複角色組合數</span>
                    <span class="stat__value">{{ overview.volume.matchCharacterCombinationCount }} <small>組</small></span>
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
    --size-stats-grid: calc(var(--base-size) * 15);
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
    grid-template-columns: repeat(auto-fit, minmax(var(--size-stats-grid), 1fr));
    gap: var(--space-md);
}

.stat__card {
    background: linear-gradient(135deg, var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container));
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    border: 1px solid var(--md-sys-color-outline-variant);
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.stat__card:hover {
    transform: translateY(-2px);
    box-shadow: var(--elevation-2);
    border-color: var(--md-sys-color-outline);
}

.stat__label {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

.stat__breakdowns {
    display: flex;
    flex-direction: column;
}

.stat__breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    padding: var(--space-xs) 0;
    font-size: var(--font-size-xs);
    border-top: 1px solid var(--md-sys-color-outline-variant);
    color: var(--md-sys-color-on-surface-variant);
}

.stat__breakdown span {
    background-color: var(--md-sys-color-surface-container-high);
    padding: calc(var(--space-xs) / 2) var(--space-xs);
    border-radius: var(--radius-sm);
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
