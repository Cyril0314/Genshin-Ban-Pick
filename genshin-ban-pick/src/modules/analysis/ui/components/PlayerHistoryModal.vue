<!-- src/modules/analysis/ui/components/PlayerHistoryModal.vue -->

<script setup lang="ts">
import { toRef } from 'vue';

import { usePlayerHistoryModal } from '../composables/usePlayerHistoryModal';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry';

import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';

const props = defineProps<{
    open: boolean;
    identity?: PlayerIdentity;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const { isLoading, record, error } = usePlayerHistoryModal(toRef(props, 'open'), toRef(props, 'identity'));
const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();

function close() {
    emit('update:open', false);
}
</script>

<template>
    <n-modal
        :show="open"
        preset="card"
        :bordered="false"
        :closable="false"
        size="medium"
        :mask-closable="true"
        :style="{
            width: '40vw',
            maxWidth: '90vw',
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
        }"
        @update:show="emit('update:open', $event)"
        @close="close"
    >
        <template #header>
            <span class="title">{{ record?.displayName ?? '玩家紀錄' }}</span>
        </template>
        <template #header-extra>
            <button type="button" class="close-button" aria-label="關閉" @click="close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                    />
                </svg>
            </button>
        </template>

        <div class="player-history scale-context" style="--base-size: 1.2vw;">
            <div v-if="isLoading" class="state-message">載入中…</div>
            <div v-else-if="error" class="state-message is-error">{{ error }}</div>
            <div v-else-if="!record || record.totalSetups === 0" class="state-message">尚無紀錄</div>
            <template v-else>
                <div class="summary">
                    <span class="label">總出場 setup</span>
                    <span class="value">{{ record.totalSetups }}</span>
                </div>

                <section class="section">
                    <h3 class="section-title">角色使用頻率（Top 10）</h3>
                    <ol class="frequency-list">
                        <li v-for="f in record.characterFrequency" :key="f.characterKey" class="frequency-row">
                            <div class="head">
                                <img class="avatar" :src="getProfileImagePath(f.characterKey)" :alt="getCharacterDisplayName(f.characterKey)" />
                                <span class="name">{{ getCharacterDisplayName(f.characterKey) }}</span>
                                <span class="count">{{ f.count }} 次</span>
                                <span class="rate">{{ (f.rate * 100).toFixed(0) }}%</span>
                            </div>
                            <ul v-if="f.topSynergies.length > 0" class="synergy-list">
                                <li v-for="s in f.topSynergies" :key="s.characterKey" class="synergy-row">
                                    <img class="synergy-avatar" :src="getProfileImagePath(s.characterKey)" :alt="getCharacterDisplayName(s.characterKey)" />
                                    <span class="synergy-name">{{ getCharacterDisplayName(s.characterKey) }}</span>
                                    <span class="synergy-count">{{ s.count }} 次</span>
                                </li>
                            </ul>
                            <div v-else class="synergy-empty">尚無全域共現資料</div>
                        </li>
                    </ol>
                </section>
            </template>
        </div>
    </n-modal>
</template>

<style scoped>
.title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-sans);
    color: var(--md-sys-color-on-surface);
}

.close-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xs);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant);
    transition: background-color 0.15s ease, color 0.15s ease;
}

.close-button:hover {
    background-color: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
}

.player-history {
    --size-avatar: calc(var(--base-size) * 3);
    --size-synergy-avatar: calc(var(--base-size) * 2);

    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.state-message {
    padding: var(--space-lg);
    text-align: center;
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-md);
}

.state-message.is-error {
    color: var(--md-sys-color-error);
}

.summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border-radius: var(--radius-md);
}

.summary .label {
    font-size: var(--font-size-sm);
    color: inherit;
    opacity: 0.85;
}

.summary .value {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: inherit;
}

.section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.section-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    margin: 0;
}

.frequency-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: 0;
    margin: 0;
    list-style: none;
}

.frequency-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-sm);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-sm);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
}

.head {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.head .name {
    flex: 1;
    font-weight: var(--font-weight-medium);
}

.head .count {
    color: var(--md-sys-color-on-surface-variant);
    min-width: calc(var(--base-size) * 2.5);
    text-align: right;
}

.head .rate {
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-primary);
    min-width: calc(var(--base-size) * 2);
    text-align: right;
}

.synergy-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-xs) 0 0 calc(var(--size-avatar) + var(--space-sm));
    margin: 0;
    list-style: none;
}

.synergy-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
}

.synergy-name {
    flex: 1;
    font-weight: var(--font-weight-regular);
    color: var(--md-sys-color-on-surface);
}

.synergy-count {
    min-width: calc(var(--base-size) * 2.5);
    text-align: right;
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
