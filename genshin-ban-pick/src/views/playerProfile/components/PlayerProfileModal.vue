<!-- src/views/playerProfile/components/PlayerProfileModal.vue -->

<script setup lang="ts">
import { X } from '@lucide/vue';
import { toPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { computed } from 'vue';

import { usePlayerProfileModal } from '../composables/usePlayerProfileModal';


import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import CharacterHoverCard from '@/modules/analysis/ui/components/CharacterHoverCard.vue';
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry';


const props = defineProps<{
    open: boolean;
    identity?: PlayerIdentity;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const { isLoading, record, error, title, characterFrequency, getBarWidth, getRowStyle, getCharacterDisplayName } = usePlayerProfileModal(
    () => props.open,
    () => props.identity,
);

const profileTo = computed(() => {
    if (!props.identity) return undefined;
    const query: Record<string, string | number | undefined> = { ...toPlayerIdentityQuery(props.identity) };
    return { name: 'PlayerProfile', query };
});
</script>

<template>
    <n-modal :show="open" :mask-closable="true" @update:show="emit('update:open', $event)">
        <div class="modal-card scale-context">
            <div class="modal-header">
                <span class="modal-title">{{ title }}</span>
                <RouterLink v-if="profileTo" :to="profileTo" class="full-link" target="_blank" rel="noopener">完整紀錄 ↗</RouterLink>
                <n-button text class="close-button" @click="emit('update:open', false)">
                    <template #icon>
                        <X />
                    </template>
                </n-button>
            </div>

            <div class="modal-body">
                <div class="player-history">
                    <div v-if="isLoading" class="state-message">載入中…</div>
                    <div v-else-if="error" class="state-message is-error">{{ error }}</div>
                    <div v-else-if="!record || record.totalSetups === 0" class="state-message">尚無紀錄</div>
                    <template v-else>
                        <section class="section">
                            <div class="section-header">
                                <h3 class="section-title">角色使用頻率</h3>
                                <span class="section-meta">共 {{ record.totalSetups }} 次</span>
                            </div>
                            <ol class="frequency-list">
                                <li
                                    v-for="f in characterFrequency"
                                    :key="f.characterKey"
                                    class="frequency-row"
                                    :style="getRowStyle(f.characterKey)"
                                >
                                    <CharacterHoverCard :character-key="f.characterKey">
                                        <img class="avatar" :src="getProfileImagePath(f.characterKey)" :alt="getCharacterDisplayName(f.characterKey)" />
                                    </CharacterHoverCard>
                                    <div class="content">
                                        <div class="head">
                                            <span class="name">{{ getCharacterDisplayName(f.characterKey) }}</span>
                                            <div class="stats">
                                                <span class="count">{{ f.count }} 次</span>
                                                <span class="rate">{{ (f.rate * 100).toFixed(0) }}%</span>
                                            </div>
                                        </div>
                                        <div class="rate-bar">
                                            <div class="rate-fill" :style="{ width: getBarWidth(f.count) }" />
                                        </div>
                                    </div>
                                </li>
                            </ol>
                        </section>
                    </template>
                </div>
            </div>
        </div>
    </n-modal>
</template>

<style scoped>
.modal-card {
    width: 60vw;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    background-color: var(--md-sys-color-surface-container-high);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    padding: var(--space-lg);
    justify-content: space-between;
}

.modal-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
}

.full-link {
    margin-left: auto;
    color: var(--md-sys-color-primary);
    text-decoration: none;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
}

.full-link:hover {
    text-decoration: underline;
}

.close-button {
    color: var(--md-sys-color-on-surface-variant);
}

.modal-body {
    overflow-y: auto;
    min-height: 0;
    padding: var(--space-lg);
}

.player-history {
    --size-avatar: calc(var(--base-size) * 3);

    display: flex;
    flex-direction: column;
    /* gap: var(--space-md); */
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
    /* gap: var(--space-sm); */
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
}

.section-meta {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
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
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    background: linear-gradient(to right, color-mix(in srgb, var(--row-accent, transparent) 14%, transparent) 0%, transparent 70%);
    transition: background-color 0.18s ease;
}

.frequency-row:last-child {
    border-bottom: none;
}

.frequency-row:hover {
    background:
        linear-gradient(to right, color-mix(in srgb, var(--row-accent, transparent) 14%, transparent) 0%, transparent 70%),
        var(--md-sys-color-surface-container-low);
}

.content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    flex: 1;
    min-width: 0;
}

.head {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.head .name {
    flex: 1;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-md);
}

.stats {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-shrink: 0;
}

.count {
    color: var(--md-sys-color-on-surface-variant);
    min-width: calc(var(--base-size) * 2.5);
    text-align: right;
    font-size: var(--font-size-sm);
}

.rate {
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
    min-width: calc(var(--base-size) * 2.5);
    text-align: right;
    font-size: var(--font-size-sm);
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

.avatar {
    width: var(--size-avatar);
    height: var(--size-avatar);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    flex-shrink: 0;
}
</style>
