<script setup lang="ts">
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { RadarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { usePlayerStyleChart } from '../composables/usePlayerStyleChart';
import { usePlayerHistory } from '../composables/usePlayerHistory';

use([CanvasRenderer, RadarChart, PieChart, GridComponent, TooltipComponent, LegendComponent]);

const { option, scopes, selectedScope, selectedScopeKey, getScopeKey } = usePlayerStyleChart();
const playerHistory = usePlayerHistory();

function openSelectedPlayerHistory() {
    if (selectedScope.value?.type !== 'Player') return;
    playerHistory.open(selectedScope.value.profile.identity);
}
</script>

<template>
    <div class="chart">
        <header class="header">
            <div class="title">
                <h2>玩家風格雷達圖</h2>
                <p class="desc">根據玩家在對局中的角色選擇，分析其多樣性、主流取向與偏好結構。</p>
                <button
                    v-if="selectedScope?.type === 'Player'"
                    type="button"
                    class="player-chip"
                    @click="openSelectedPlayerHistory"
                >
                    <span class="player-chip-name">{{ selectedScope.profile.displayName }}</span>
                    <span class="player-chip-hint">查看紀錄</span>
                </button>
            </div>
            <div class="settings">
                <span class="player-text">玩家：</span>
                <select v-model="selectedScopeKey" class="player-select">
                    <option v-for="scope in scopes" :key="getScopeKey(scope)"
                        :value="getScopeKey(scope)">
                        <!-- Global -->
                        <template v-if="scope.type === 'Global'">
                            🌐 全體玩家
                        </template>

                        <!-- Player -->
                        <template v-else>
                            <span v-if="scope.profile.identity.type === 'Member'">✨</span>
                            <span v-else-if="scope.profile.identity.type === 'Guest'">❓</span>
                            <span v-else>🪪</span>
                            {{ scope.profile.displayName }}
                        </template>
                    </option>
                </select>
            </div>

        </header>
        <div class="canvas">
            <VChart v-if="option" :option="option" :update-options="{ notMerge: true }" autoresize />
            <div v-else class="empty">尚無足夠數據進行分析</div>
        </div>
        <footer class="footer">
            <small>
                ※ 本分析僅反映玩家的選角分佈與偏好結構，並不代表角色強度或表現。<br />
                ※ 各維度數值為相對於全體玩家資料的調整結果，用於描述風格差異。
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

.settings {
    display: flex;
    flex-direction: row;
    align-items: top;
    height: fit-content;
    gap: var(--space-sm);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.player-text {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.player-select {
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-high);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    width: var(--size-chart-select);
    border-radius: var(--radius-md);
    align-items: center;
    text-align: center;
    justify-content: center;
    outline: none;
    border: none;
}

.player-select:focus {
    outline: none;
    border: none;
}

.player-select:hover {
    transform: scale(1.05);
}

.player-chip {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-md);
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: background-color 0.15s ease, transform 0.15s ease;
}

.player-chip:hover {
    background-color: var(--primary-filled-hover);
    transform: scale(1.03);
}

.player-chip-name {
    font-weight: var(--font-weight-bold);
}

.player-chip-hint {
    font-size: var(--font-size-sm);
    opacity: 0.75;
    margin-left: var(--space-xs);
}

.canvas {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
}

.empty {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-md);
}

.footer {
    display: flex;
    color: var(--md-sys-color-on-surface-variant);
    padding: var(--space-md);
    font-size: var(--font-size-md);
}
</style>
