<!-- src/modules/analysis/ui/components/MatchOverviewChart.vue.vue -->

<script setup lang="ts">
import { ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent, DataZoomComponent, MarkAreaComponent } from 'echarts/components';
import { useMatchOverviewChart } from '../composables/useMatchOverviewChart';
import { Element, Rarity } from '@shared/contracts/character/value-types';
import { MoveSource, MoveType } from '@shared/contracts/match/value-types';

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

const { option, overview, findNearestMatch, openMatch } = useMatchOverviewChart();

const chartRef = ref<InstanceType<typeof VChart>>();

// 不靠單一符號的微小命中區，改在整個繪圖區攔截點擊：
// 將點擊像素轉成時間，找最接近的 match，且與該 match 的水平距離夠近才開窗。
const HIT_TOLERANCE_PX = 24;
function onZrClick(event: any) {
    const chart: any = chartRef.value;
    if (!chart) return;

    const point = [event.offsetX, event.offsetY];
    if (!chart.containPixel('grid', point)) return;

    const converted = chart.convertFromPixel({ gridIndex: 0 }, point);
    const timeMs = Array.isArray(converted) ? converted[0] : converted;
    const match = findNearestMatch(timeMs);
    if (!match) return;

    const matchPixel = chart.convertToPixel({ gridIndex: 0 }, [match.createdAt, 0.5]);
    const matchX = Array.isArray(matchPixel) ? matchPixel[0] : matchPixel;
    if (Math.abs(matchX - event.offsetX) <= HIT_TOLERANCE_PX) {
        openMatch(match.id);
    }
}
</script>

<template>
    <div class="chart">
        <header class="header">
            <div class="title">
                <h2>總覽</h2>
                <p class="desc">顯示全部遊玩場次的統計資料。</p>
            </div>
        </header>
        <div class="overview" v-if="overview">
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">總遊玩局數</span>
                    <span class="stat-value">{{ overview.volume.matchCount }} <small>次</small></span>
                </div>

                <div class="stat-card">
                    <span class="stat-label">總玩家數</span>
                    <span class="stat-value">{{ overview.volume.players.total }} <small>人</small></span>
                    <div class="stat-breakdowns">
                        <div class="stat-breakdown">
                            <span title="會員">會員 {{ overview.volume.players.member }}</span>
                            <span title="訪客">訪客 {{ overview.volume.players.guest }}</span>
                            <span title="僅名稱">僅名稱 {{ overview.volume.players.onlyName }}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <span class="stat-label">出場角色數</span>
                    <span class="stat-value">{{ overview.volume.characters.total }} <small>名</small></span>
                    <div class="stat-breakdowns">
                        <div class="stat-breakdown">
                            <span title="5★">5★ {{ overview.volume.characters.byRarity[Rarity.FiveStar] }}</span>
                            <span title="4★">4★ {{ overview.volume.characters.byRarity[Rarity.FourStar] }}</span>
                        </div>
                        <div class="stat-breakdown">
                            <span title="風">風 {{ overview.volume.characters.byElement[Element.Anemo] }}</span>
                            <span title="岩">岩 {{ overview.volume.characters.byElement[Element.Geo] }}</span>
                            <span title="雷">雷 {{ overview.volume.characters.byElement[Element.Electro] }}</span>
                            <span title="草">草 {{ overview.volume.characters.byElement[Element.Dendro] }}</span>
                            <span title="水">水 {{ overview.volume.characters.byElement[Element.Hydro] }}</span>
                            <span title="火">火 {{ overview.volume.characters.byElement[Element.Pyro] }}</span>
                            <span title="冰">冰 {{ overview.volume.characters.byElement[Element.Cryo] }}</span>
                            <span title="無">無 {{ overview.volume.characters.byElement[Element.None] }}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <span class="stat-label">總移動次數</span>
                    <span class="stat-value">{{ overview.volume.moves.total }} <small>次</small></span>
                    <div class="stat-breakdowns">
                        <div class="stat-breakdown">
                            <span title="Ban">Ban {{ overview.volume.moves.byType[MoveType.Ban] }}</span>
                            <span title="Pick">Pick {{ overview.volume.moves.byType[MoveType.Pick] }}</span>
                            <span title="Utility">Utility {{ overview.volume.moves.byType[MoveType.Utility] }}</span>
                        </div>
                        <div class="stat-breakdown">
                            <span title="手動">手動 {{ overview.volume.moves.bySource[MoveSource.Manual] }}</span>
                            <span title="隨機">隨機 {{ overview.volume.moves.bySource[MoveSource.Random] }}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-card">
                    <span class="stat-label">不重複玩家組合數</span>
                    <span class="stat-value">{{ overview.volume.matchTeamMemberCombinationCount }} <small>組</small></span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">不重複角色組合數</span>
                    <span class="stat-value">{{ overview.volume.matchCharacterCombinationCount }} <small>組</small></span>
                </div>
            </div>
        </div>
        <div class="canvas">
            <VChart v-if="option" ref="chartRef" :option="option" @zr:click="onZrClick" />
        </div>
    </div>
</template>

<style scoped>
.chart {
    --size-stats-grid: calc(var(--base-size) * 15);
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

.overview {
    display: flex;
    flex-direction: column;
    padding: var(--space-sm);
}

/* 網格佈局 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--size-stats-grid), 1fr));
    gap: var(--space-md);
}

.stat-card {
    background: linear-gradient(135deg, var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container));
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    border: 1px solid var(--md-sys-color-outline-variant);
    transition:
        transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    border-color: var(--md-sys-color-outline);
}

.stat-label {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-primary);
}

.stat-value small {
    font-size: var(--font-size-md);
    font-weight: normal;
    margin-left: 2px;
}

.stat-breakdowns {
    display: flex;
    flex-direction: column;
}

.stat-breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    padding: var(--space-xs) 0;
    font-size: var(--font-size-sm);
    border-top: 1px solid var(--md-sys-color-outline-variant);
    color: var(--md-sys-color-on-surface-variant);
}

.stat-breakdown span {
    background-color: var(--md-sys-color-surface-container-high);
    padding: calc(var(--space-xs) / 2) var(--space-xs);
    border-radius: var(--radius-sm);
}

.canvas {
    display: flex;
    width: 100%;
    height: 100%;
}
</style>
