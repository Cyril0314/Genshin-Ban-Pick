<script setup lang="ts">
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { RadarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { usePlayerStyleChart } from '../composables/usePlayerStyleChart';

use([CanvasRenderer, RadarChart, PieChart, GridComponent, TooltipComponent, LegendComponent]);

const { playerSelectOptions, globalOption, option, selectedOptionKey, getOptionKey } = usePlayerStyleChart();
</script>

<template>
    <div class="layout__chart">
        <header class="chart__header">
            <div class="chart__title">
                <h2>玩家風格雷達圖</h2>
                <p class="chart-desc">根據玩家在對局中的角色選擇，分析其多樣性、主流取向與偏好結構。</p>

            </div>
            <div class="chart__settings">
                <span class="chart-player__text">玩家：</span>
                <select v-model="selectedOptionKey" class="chart-player__select">
                    <option v-for="option in playerSelectOptions" :key="getOptionKey(option)"
                        :value="getOptionKey(option)">
                        <!-- Global -->
                        <template v-if="option.type === 'Global'">
                            🌐 全體玩家
                        </template>

                        <!-- Player -->
                        <template v-else>
                            <span v-if="option.identity.type === 'Member'">✨</span>
                            <span v-else-if="option.identity.type === 'Guest'">❓</span>
                            <span v-else>🪪</span>
                            {{ option.identity.name }}
                        </template>
                    </option>
                </select>
            </div>

        </header>
        <div class="chart">
            <VChart v-if="option" :option="option" autoresize />
            <div v-else class="chart__empty">尚無足夠數據進行分析</div>
        </div>
        <footer class="chart__footer">
            <small>
                ※ 本分析僅反映玩家的選角分佈與偏好結構，並不代表角色強度或表現。<br />
                ※ 各維度數值為相對於全體玩家資料的調整結果，用於描述風格差異。
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
    padding: var(--space-md);
}

.chart__title {
    display: flex;
    flex-direction: column;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.chart-desc {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
    margin-top: var(--space-xs);
}

.chart__settings {
    display: flex;
    flex-direction: row;
    align-items: top;
    height: fit-content;
    gap: var(--space-sm);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.chart-player__text {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.chart-player__select {
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

.chart-player__select:focus {
    outline: none;
    border: none;
}

.chart-player__select:hover {
    transform: scale(1.05);
}

.chart {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
}

.chart__empty {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-md);
}

.chart__footer {
    display: flex;
    color: var(--md-sys-color-on-surface-variant);
    padding: var(--space-md);
    font-size: var(--font-size-md);
}
</style>
