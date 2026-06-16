<!-- src/views/playerProfile/components/PlayerProfileModal.vue -->

<script setup lang="ts">
import { X } from '@lucide/vue';
import { toPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { computed } from 'vue';

import { usePlayerProfileModal } from '../composables/usePlayerProfileModal';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import PlayerCharacterFrequencyList from '@/modules/player/ui/components/PlayerCharacterFrequencyList.vue';

const props = defineProps<{
    open: boolean;
    identity?: PlayerIdentity;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const { isLoading, usage, error, title, characterFrequency } = usePlayerProfileModal(
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
                    <div v-else-if="!usage" class="state-message">尚無紀錄</div>
                    <template v-else>
                        <section class="section">
                            <div class="section-header">
                                <h3 class="section-title">角色使用次數</h3>
                            </div>
                            <PlayerCharacterFrequencyList :frequency="characterFrequency" />
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
</style>
