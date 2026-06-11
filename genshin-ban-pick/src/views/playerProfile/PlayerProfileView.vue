<!-- src/views/playerProfile/PlayerProfileView.vue -->

<script setup lang="ts">
import { fromPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { RadarChart, PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { useRoute } from 'vue-router';

import { usePlayerProfileView } from './composables/usePlayerProfileView';

import CharacterHoverCard from '@/modules/analysis/ui/components/CharacterHoverCard.vue';
import MatchHistoryModal from '@/modules/match/ui/components/MatchHistoryModal.vue';

use([CanvasRenderer, RadarChart, PieChart, TooltipComponent]);

const route = useRoute();
const identity = computed(() => fromPlayerIdentityQuery(route.query));

const {
    state: { isLoading, error, record, matches, teammates, title, characterFrequency },
    style: { radarOption, donutCharts, isLoading: styleLoading },
    display: { getCharacterDisplayName, getProfileImagePath, getTeamMemberName, getBarWidth, getRowStyle, dateLabel, teammateQuery },
} = usePlayerProfileView(identity);

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
        <header class="header">
            <h1 class="title">{{ title }}</h1>
        </header>

        <div v-if="!identity" class="state-message is-error">缺少玩家參數</div>
        <div v-else-if="isLoading" class="state-message">載入中…</div>
        <div v-else-if="error" class="state-message is-error">{{ error }}</div>

        <template v-else>
            <!-- (b) PlayerStyle 雷達 hero -->
            <section class="card">
                <h2 class="card-title">打法風格</h2>
                <div class="radar-hero">
                    <VChart v-if="radarOption" :option="radarOption" :update-options="{ notMerge: true }" autoresize />
                    <div v-else-if="styleLoading" class="state-message">分析中…</div>
                    <div v-else class="state-message">尚無足夠數據進行分析</div>
                </div>
            </section>

            <!-- (b) 屬性分佈 donut 格 -->
            <section v-if="donutCharts.length" class="card">
                <h2 class="card-title">屬性分佈</h2>
                <div class="donut-grid">
                    <div v-for="d in donutCharts" :key="d.key" class="donut-cell">
                        <span class="donut-label">{{ d.label }}</span>
                        <VChart class="donut-chart" :option="d.option" :update-options="{ notMerge: true }" autoresize />
                    </div>
                </div>
            </section>

            <!-- (a) 角色使用頻率 -->
            <section class="card">
                <div class="card-header">
                    <h2 class="card-title">角色使用頻率（Top 10）</h2>
                    <span class="card-meta" v-if="record">共 {{ record.totalSetups }} 次</span>
                </div>
                <div v-if="!record || record.totalSetups === 0" class="state-message">尚無紀錄</div>
                <ol v-else class="frequency-list">
                    <li
                        v-for="f in characterFrequency"
                        :key="f.characterKey"
                        class="frequency-row"
                        :style="getRowStyle(f.characterKey)"
                    >
                        <CharacterHoverCard :character-key="f.characterKey">
                            <img class="avatar" :src="getProfileImagePath(f.characterKey)" :alt="getCharacterDisplayName(f.characterKey)" />
                        </CharacterHoverCard>
                        <div class="frequency-content">
                            <div class="frequency-head">
                                <span class="frequency-name">{{ getCharacterDisplayName(f.characterKey) }}</span>
                                <span class="frequency-stats">
                                    <span class="count">{{ f.count }} 次</span>
                                    <span class="rate">{{ (f.rate * 100).toFixed(0) }}%</span>
                                </span>
                            </div>
                            <div class="rate-bar">
                                <div class="rate-fill" :style="{ width: getBarWidth(f.count) }" />
                            </div>
                            <ul v-if="f.topCooccurrenceEntries.length > 0" class="cooccurrence-list">
                                <CharacterHoverCard v-for="s in f.topCooccurrenceEntries" :key="s.key" :character-key="s.key">
                                    <li class="cooccurrence-chip">
                                        <img class="cooccurrence-avatar" :src="getProfileImagePath(s.key)" :alt="getCharacterDisplayName(s.key)" />
                                        <span class="cooccurrence-name">{{ getCharacterDisplayName(s.key) }}</span>
                                        <span class="cooccurrence-count">×{{ s.count }}</span>
                                    </li>
                                </CharacterHoverCard>
                            </ul>
                        </div>
                    </li>
                </ol>
            </section>

            <!-- (d) 最常隊友 -->
            <section class="card">
                <h2 class="card-title">最常搭配隊友</h2>
                <div v-if="teammates.length === 0" class="state-message">尚無隊友資料</div>
                <ul v-else class="teammate-list">
                    <li v-for="t in teammates" :key="getTeamMemberName(t.teamMember)" class="teammate-row">
                        <RouterLink class="teammate-link" :to="{ name: 'PlayerProfile', query: teammateQuery(t.teamMember) }">
                            <span class="teammate-name">{{ getTeamMemberName(t.teamMember) }}</span>
                        </RouterLink>
                        <span class="teammate-count">同隊 {{ t.count }} 場</span>
                    </li>
                </ul>
            </section>

            <!-- (c) 參與場次 -->
            <section class="card">
                <h2 class="card-title">參與場次（{{ matches.length }}）</h2>
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
        </template>

        <MatchHistoryModal v-model:open="matchHistoryOpen" :match-id="matchHistoryId" />
    </div>
</template>

<style scoped>
.player-profile {
    --size-avatar: calc(var(--base-size) * 3);
    --size-cooccurrence-avatar: calc(var(--base-size) * 1.5);

    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    max-width: 1080px;
    margin: 0 auto;
    padding: var(--space-xl);
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-background);
}

.header {
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
}

.title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
}

.card {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg);
    background-color: var(--md-sys-color-surface-container-high);
    border-radius: var(--radius-lg);
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

.radar-hero {
    width: 100%;
    height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.donut-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
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

.donut-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface-variant);
}

.donut-chart {
    width: 100%;
    height: 160px;
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

.frequency-list {
    display: flex;
    flex-direction: column;
    padding: 0;
    list-style: none;
}

.frequency-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-sm);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    background: linear-gradient(to right, color-mix(in srgb, var(--row-accent, transparent) 14%, transparent) 0%, transparent 70%);
}

.frequency-row:last-child {
    border-bottom: none;
}

.avatar {
    width: var(--size-avatar);
    height: var(--size-avatar);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    flex-shrink: 0;
}

.frequency-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    flex: 1;
    min-width: 0;
}

.frequency-head {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.frequency-name {
    flex: 1;
    font-weight: var(--font-weight-medium);
}

.frequency-stats {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-shrink: 0;
    font-size: var(--font-size-sm);
}

.count {
    color: var(--md-sys-color-on-surface-variant);
}

.rate {
    font-weight: var(--font-weight-bold);
}

.rate-bar {
    width: 100%;
    height: 3px;
    background: var(--md-sys-color-outline-variant);
    border-radius: 999px;
    overflow: hidden;
}

.rate-fill {
    height: 100%;
    background: var(--row-accent, var(--md-sys-color-primary));
    border-radius: inherit;
    transition: width 0.35s ease;
}

.cooccurrence-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    padding: 0;
    list-style: none;
}

.cooccurrence-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 999px;
    font-size: var(--font-size-sm);
}

.cooccurrence-avatar {
    width: var(--size-cooccurrence-avatar);
    height: var(--size-cooccurrence-avatar);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    flex-shrink: 0;
}

.cooccurrence-name {
    font-weight: var(--font-weight-medium);
}

.cooccurrence-count {
    color: var(--md-sys-color-on-surface-variant);
}

.teammate-list {
    display: flex;
    flex-direction: column;
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
    color: var(--md-sys-color-primary);
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
    gap: var(--space-sm);
    padding: 0;
    list-style: none;
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
    background-color: var(--md-sys-color-surface-container);
}

.match-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    flex-shrink: 0;
}

.match-date {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
}

.match-team {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
}

.match-characters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    justify-content: flex-end;
}

.match-avatar {
    width: var(--size-cooccurrence-avatar);
    height: var(--size-cooccurrence-avatar);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
}
</style>
