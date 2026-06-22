<!-- src/views/playerProfile/PlayerProfileView.vue -->

<script setup lang="ts">
import { fromPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { RadarChart, PieChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent } from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { useRoute } from 'vue-router';

import { usePlayerProfileView } from './composables/usePlayerProfileView';

import CharacterHoverCard from '@/modules/analysis/ui/components/CharacterHoverCard.vue';
import MatchHistoryModal from '@/modules/match/ui/components/MatchHistoryModal.vue';
import PlayerCharacterFrequencyList from '@/modules/player/ui/components/PlayerCharacterFrequencyList.vue';
import { provideCharacterHoverWrapper } from '@/modules/shared/ui/context/characterHoverWrapperContext';

use([CanvasRenderer, RadarChart, PieChart, TooltipComponent, TitleComponent]);

const route = useRoute();
const identity = computed(() => fromPlayerIdentityQuery(route.query));

const {
    state: {
        isLoading,
        error,
        usage,
        setupCount,
        matchCount,
        characterCount,
        teammateCount,
        signatureCharacter,
        matches,
        displayTeammates,
        title,
        characterFrequency,
    },
    style: { radarOption, donutCharts, isLoading: styleLoading },
    display: { getCharacterDisplayName, getProfileImagePath, getTeamMemberName, dateLabel, teammateQuery },
} = usePlayerProfileView(identity);

provideCharacterHoverWrapper(CharacterHoverCard);

// match drill-down 的開窗狀態屬 view 組裝層，留在這裡
const matchHistoryOpen = ref(false);
const matchHistoryId = ref<number>();
function openMatchHistory(matchId: number) {
    matchHistoryId.value = matchId;
    matchHistoryOpen.value = true;
}
</script>

<template>
    <div class="player-profile scale-context">
        <div v-if="!identity" class="state-message is-error">缺少玩家參數</div>
        <div v-else-if="isLoading" class="state-message">載入中…</div>
        <div v-else-if="error" class="state-message is-error">{{ error }}</div>

        <div v-else class="dashboard">
            <div class="dashboard-col dashboard-col-left">
                <!-- (b) PlayerStyle 雷達 hero -->
                <section class="card area-overview">
                    <div class="overview-header">
                        <CharacterHoverCard v-if="signatureCharacter" :character-key="signatureCharacter">
                            <img
                                class="overview-signature"
                                :src="getProfileImagePath(signatureCharacter)"
                                :alt="getCharacterDisplayName(signatureCharacter)"
                            />
                        </CharacterHoverCard>
                        <h2 class="card-title">{{ title }}</h2>
                    </div>
                    <div class="overview-metrics">
                        <div class="overview-metrics-group">
                            <div class="overview-metric">
                                <span class="overview-metric-value">{{ matchCount }}</span>
                                <span class="overview-metric-label">遊玩場次</span>
                            </div>
                            <div class="overview-metric">
                                <span class="overview-metric-value">{{ characterCount }}</span>
                                <span class="overview-metric-label">使用角色</span>
                            </div>
                            <div class="overview-metric">
                                <span class="overview-metric-value">{{ teammateCount }}</span>
                                <span class="overview-metric-label">同隊人數</span>
                            </div>
                            <div class="overview-metric">
                                <span class="overview-metric-value">{{ setupCount }}</span>
                                <span class="overview-metric-label">總出場次數</span>
                            </div>
                        </div>
                    </div>
                    <div class="radar-chart">
                        <VChart v-if="radarOption" :option="radarOption" :update-options="{ notMerge: true }" autoresize />
                        <div v-else-if="styleLoading" class="state-message">分析中…</div>
                        <div v-else class="state-message">尚無足夠資料進行分析</div>
                    </div>
                </section>

                <!-- (b) 角色分佈 donut 格 -->
                <section v-if="donutCharts.length" class="card area-donut">
                    <h2 class="card-title">角色分佈</h2>
                    <div class="donut-grid">
                        <div v-for="d in donutCharts" :key="d.key" class="donut-cell">
                            <VChart class="donut-chart" :option="d.option" :update-options="{ notMerge: true }" autoresize />
                            <span class="donut-label">{{ d.label }}</span>
                        </div>
                    </div>
                </section>
            </div>

            <!-- (a) 角色使用頻率 -->
            <section class="card area-frequency">
                <div class="card-header">
                    <h2 class="card-title">角色使用次數</h2>
                </div>
                <div v-if="!usage" class="state-message">尚無紀錄</div>
                <PlayerCharacterFrequencyList v-else :frequency="characterFrequency" />
            </section>

            <div class="dashboard-col dashboard-col-right">
                <!-- (d) 最常隊友 -->
                <section class="card area-teammate">
                    <h2 class="card-title">最常搭配隊友</h2>
                    <div v-if="displayTeammates.length === 0" class="state-message">尚無隊友資料</div>
                    <ul v-else class="teammate-list">
                        <li v-for="t in displayTeammates" :key="getTeamMemberName(t.teamMember)" class="teammate-row">
                            <RouterLink class="teammate-link" :to="{ name: 'PlayerProfile', query: teammateQuery(t.teamMember) }">
                                <span class="teammate-name">{{ getTeamMemberName(t.teamMember) }}</span>
                            </RouterLink>
                            <span class="teammate-count">同隊 {{ t.count }} 場</span>
                        </li>
                    </ul>
                </section>

                <!-- (c) 參與場次 -->
                <section class="card area-matches">
                    <h2 class="card-title">參與場次</h2>
                    <div v-if="matches.length === 0" class="state-message">尚無場次</div>
                    <ul v-else class="match-list">
                        <li v-for="m in matches" :key="m.matchId" class="match-row" @click="openMatchHistory(m.matchId)">
                            <div class="match-meta">
                                <span class="match-date">{{ dateLabel(m.createdAt) }}</span>
                            </div>
                            <div class="match-characters">
                                <CharacterHoverCard v-for="key in m.characterKeys" :key="key" :character-key="key">
                                    <img class="match-avatar" :src="getProfileImagePath(key)" :alt="getCharacterDisplayName(key)" />
                                </CharacterHoverCard>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
        </div>

        <MatchHistoryModal v-model:open="matchHistoryOpen" :match-id="matchHistoryId" />
    </div>
</template>

<style scoped>
.player-profile {
    --size-avatar: calc(var(--base-size) * 3);
    --size-cooccurrence-avatar: calc(var(--base-size) * 1.5);
    --size-match-avatar: calc(var(--base-size) * 2.25);

    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: var(--space-xl);
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-background);
    /* 軟上限：內容少時頁面自然縮，內容多時夾住、由卡片內捲消化 */
    max-height: 100vh;
    overflow: hidden;
}

/* bento dashboard：左欄固定分析視覺、中欄 Top10 整欄、右欄隊友+場次 */
.dashboard {
    display: grid;
    grid-template-columns: minmax(calc(var(--base-size) * 18), 0.8fr) minmax(0, 1.2fr) minmax(calc(var(--base-size) * 18), 0.8fr);
    grid-template-rows: minmax(0, 1fr);
    grid-template-areas: 'leftcol frequency rightcol';
    gap: var(--space-lg);
    /* 吃掉 header 以外的剩餘高度（不手算 header 尺寸），溢出由卡片內捲處理 */
    flex: 1;
    min-height: 0;
}

/* 左右兩欄各為獨立的垂直 flex：各自「上方依內容、下方吃剩餘」 —— 單一 grid 的 row 線貫穿全寬，做不到分欄獨立 */
.dashboard-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    min-height: 0;
}

.dashboard-col-left {
    grid-area: leftcol;
}

.dashboard-col-right {
    grid-area: rightcol;
}

/* 左欄：overview（含雷達）依內容撐出自然高度，donut 吃掉剩餘空間 */
.dashboard-col-left .area-overview {
    flex: 0 0 auto;
}

.dashboard-col-left .area-donut {
    flex: 1;
    min-height: 0;
}

/* 右欄：teammate 依內容撐高，matches 吃掉剩餘空間 */
.dashboard-col-right .area-teammate {
    flex: 0 0 auto;
}

.dashboard-col-right .area-matches {
    flex: 1;
    min-height: 0;
}

.area-overview {
    grid-area: overview;
}

.area-donut {
    grid-area: donut;
}

.area-frequency {
    grid-area: frequency;
}

.area-teammate {
    grid-area: teammate;
}

.area-matches {
    grid-area: matches;
}

/* 窄螢幕：回到單欄垂直堆疊，解除高度夾制讓頁面自然捲動 */
@media (max-width: 1200px) {
    .player-profile {
        max-height: none;
        overflow: visible;
    }

    .dashboard {
        grid-template-columns: 1fr;
        grid-template-areas:
            'overview'
            'donut'
            'frequency'
            'teammate'
            'matches';
        grid-template-rows: none;
        flex: none;
    }

    .dashboard-col {
        display: contents;
    }
}

.card {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg);
    background-color: var(--md-sys-color-surface-container);
    border-radius: var(--radius-lg);
    /* grid 子項需 min-height:0 才能讓內部列表接管溢出 */
    min-height: 0;
}

.card-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
}

.card-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
}

.card-meta {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
}

.overview-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-shrink: 0;
}

.overview-signature {
    width: var(--size-match-avatar);
    height: var(--size-match-avatar);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    flex-shrink: 0;
}

.overview-metrics {
    /* 卡片撐滿版型；內部群組置中 */
    display: flex;
    justify-content: center;
    background-color: var(--md-sys-color-surface-container-highest);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-lg);
    flex-shrink: 0;
}

.overview-metrics-group {
    /* 放得下時一組等寬置中；放不下時整個 stat 項換列（不壓窄欄、不讓文字換行） */
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-lg);
}

.overview-metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    /* 等寬基準；內容（數字/標籤）一律不換行 */
    min-width: calc(var(--base-size) * 3);
    white-space: nowrap;
}

.overview-metric-value {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
}

.overview-metric-label {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.radar-chart {
    width: 100%;
    /* overview 依內容撐高，雷達自身要有確定高度，否則 flex 鏈到此會塌成 0 */
    flex: 1;
    min-height: calc(var(--base-size) * 12);
    display: flex;
    align-items: center;
    justify-content: center;
}

.donut-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* 用卡片剩餘空間等分各列（6 個 → 3×2），列高均分而非固定 */
    grid-auto-rows: 1fr;
    gap: var(--space-md);
    flex: 1;
    min-height: 0;
    /* 空間不足時（窄螢幕 / auto 高）才內捲，由 donut-chart 的 min-height 保底 */
    overflow-y: auto;
    scrollbar-width: none;
}

.donut-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-md);
}

.donut-chart {
    width: 100%;
    /* 桌機：吃滿均分後的 cell 高度；窄螢幕：靠 min-height 保底不塌 */
    flex: 1;
    min-height: calc(var(--base-size) * 4);
}

@media (max-width: 720px) {
    .donut-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.state-message {
    padding: var(--space-md);
    text-align: center;
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-md);
}

.state-message.is-error {
    color: var(--md-sys-color-error);
}

.teammate-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0;
    list-style: none;
}

.teammate-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-sm);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.teammate-row:last-child {
    border-bottom: none;
}

.teammate-link {
    color: var(--md-sys-color-on-surface);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
}

.teammate-link:hover {
    text-decoration: underline;
}

.teammate-count {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
}

.match-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    gap: var(--space-md);
    padding: 0;
    list-style: none;
    scrollbar-width: none;
}

.match-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background-color 0.15s ease;
}

.match-row:hover {
    background-color: var(--md-sys-color-surface-container-high);
}

.match-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    flex-shrink: 0;
}

.match-date {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-md);
}
.match-characters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
    justify-content: flex-end;
}

.match-avatar {
    width: var(--size-match-avatar);
    aspect-ratio: 1;
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
}
</style>
