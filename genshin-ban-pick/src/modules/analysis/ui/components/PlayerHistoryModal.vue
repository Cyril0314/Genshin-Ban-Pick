<!-- src/modules/analysis/ui/components/PlayerHistoryModal.vue -->

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayerHistoryModal } from '../composables/usePlayerHistoryModal';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { useCharacterStore } from '@/modules/character';
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';

import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';
import type { Element } from '@shared/contracts/character/value-types';

const props = defineProps<{
    open: boolean;
    identity?: PlayerIdentity;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const { isLoading, record, error } = usePlayerHistoryModal(toRef(props, 'open'), toRef(props, 'identity'));
const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
const { characterMap } = storeToRefs(useCharacterStore());

// 進度條相對縮放：最高的角色 = 滿條，其他依比例縮放，讓 1~10 名差距視覺化
const maxCount = computed(() => record.value?.characterFrequency[0]?.count ?? 0);
function getBarWidth(count: number): string {
    if (maxCount.value <= 0) return '0%';
    return `${(count / maxCount.value) * 100}%`;
}

// 元素色彩點綴：從 character store 抓 element，沒抓到就 fallback 中性灰
function getElementAccent(characterKey: string): string {
    const element = characterMap.value[characterKey]?.element as Element | undefined;
    return element ? elementColors[element].main : '#555555';
}
function getRowStyle(characterKey: string) {
    return { '--row-accent': getElementAccent(characterKey) };
}

function close() {
    emit('update:open', false);
}
</script>

<template>
    <n-modal
        :show="open"
        preset="card"
        :title="record?.displayName ?? '玩家紀錄'"
        :bordered="false"
        :closable="false"
        size="large"
        :mask-closable="true"
        :style="{
            width: '60vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
        }"
        content-class="scale-context"
        content-style="overflow-y: auto; min-height: 0; --base-size: 1.2vw;"
        @update:show="emit('update:open', $event)"
        @close="close"
    >
        <template #header-extra>
            <n-button text class="close-button" @click="emit('update:open', false)">
                <template #icon>
                    <n-icon size="20">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                            />
                        </svg>
                    </n-icon>
                </template>
            </n-button>
        </template>

        <div class="player-history">
            <div v-if="isLoading" class="state-message">載入中…</div>
            <div v-else-if="error" class="state-message is-error">{{ error }}</div>
            <div v-else-if="!record || record.totalSetups === 0" class="state-message">尚無紀錄</div>
            <template v-else>
                <section class="section">
                    <div class="section-header">
                        <h3 class="section-title">角色使用頻率（Top 10）</h3>
                        <span class="section-meta">共 {{ record.totalSetups }} 場</span>
                    </div>
                    <ol class="frequency-list">
                        <li
                            v-for="f in record.characterFrequency"
                            :key="f.characterKey"
                            class="frequency-row"
                            :style="getRowStyle(f.characterKey)"
                        >
                            <img
                                class="avatar"
                                :src="getProfileImagePath(f.characterKey)"
                                :alt="getCharacterDisplayName(f.characterKey)"
                            />
                            <div class="content">
                                <div class="head">
                                    <span class="name">{{ getCharacterDisplayName(f.characterKey) }}</span>
                                    <div class="metrics">
                                        <span class="count">{{ f.count }} 次</span>
                                        <div class="rate-cell">
                                            <span class="rate">{{ (f.rate * 100).toFixed(0) }}%</span>
                                            <div class="rate-bar">
                                                <div class="rate-fill" :style="{ width: getBarWidth(f.count) }" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="f.topSynergies.length > 0" class="synergies">
                                    <span class="synergies-label">常用隊友</span>
                                    <ul class="synergy-list">
                                        <li v-for="s in f.topSynergies" :key="s.characterKey" class="synergy-chip">
                                            <img
                                                class="synergy-avatar"
                                                :src="getProfileImagePath(s.characterKey)"
                                                :alt="getCharacterDisplayName(s.characterKey)"
                                            />
                                            <span class="synergy-name">{{ getCharacterDisplayName(s.characterKey) }}</span>
                                            <span class="synergy-count">×{{ s.count }}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div v-else class="synergy-empty">尚無全域共現資料</div>
                            </div>
                        </li>
                    </ol>
                </section>
            </template>
        </div>
    </n-modal>
</template>

<style scoped>
.close-button {
    color: var(--md-sys-color-on-surface-variant);
}

.player-history {
    --size-avatar: calc(var(--base-size) * 3);
    --size-synergy-avatar: calc(var(--base-size) * 1.5);

    display: flex;
    flex-direction: column;
    gap: var(--space-md);
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

.section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.section-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.section-title {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
    margin: 0;
}

.section-meta {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
}

.section-meta::before {
    content: '· ';
}

.frequency-list {
    display: flex;
    flex-direction: column;
    padding: 0;
    list-style: none;
}

/* 每一列：底色為「深灰 + 元素色極淡漸層」，列間用 border-bottom 分隔；hover 亮起 */
.frequency-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-sm);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    background: linear-gradient(
        to right,
        color-mix(in srgb, var(--row-accent, transparent) 14%, transparent) 0%,
        transparent 70%
    );
    transition: background-color 0.18s ease;
}

.frequency-row:last-child {
    border-bottom: none;
}

.frequency-row:hover {
    background:
        linear-gradient(
            to right,
            color-mix(in srgb, var(--row-accent, transparent) 14%, transparent) 0%,
            transparent 70%
        ),
        var(--md-sys-color-surface-container-low);
}

.content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    flex: 1;
    min-width: 0;
}

/* head 一列：name 左 + metrics 右、垂直置中對齊 */
.head {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.head .name {
    flex: 1;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-lg);
}

.metrics {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.head .count {
    color: var(--md-sys-color-on-surface-variant);
    min-width: calc(var(--base-size) * 2.5);
    text-align: right;
}

/* rate cell：百分比 + 細長進度條（相對最高者縮放） */
.rate-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-xs);
    min-width: calc(var(--base-size) * 5);
}

.rate-cell .rate {
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-primary);
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
    background: var(--md-sys-color-primary);
    border-radius: inherit;
    transition: width 0.35s ease;
}

/* synergies 區塊：「常用隊友」label 左 + 膠囊列 */
.synergies {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
}

.synergies-label {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
    font-weight: var(--font-weight-regular);
    flex-shrink: 0;
}

.synergy-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    padding: 0;
    list-style: none;
}

.synergy-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 999px;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-sm);
}

.synergy-name {
    font-weight: var(--font-weight-medium);
}

.synergy-count {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-xs);
}

.synergy-empty {
    padding-left: calc(var(--size-avatar) + var(--space-sm));
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
    font-style: italic;
}

.avatar {
    width: var(--size-avatar);
    height: var(--size-avatar);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    flex-shrink: 0;
}

.synergy-avatar {
    width: var(--size-synergy-avatar);
    height: var(--size-synergy-avatar);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    flex-shrink: 0;
}
</style>
