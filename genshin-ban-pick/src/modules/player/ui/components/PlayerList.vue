<!-- src/modules/player/ui/components/PlayerList.vue -->

<script setup lang="ts">
import { usePlayerList } from '../composables/usePlayerList';

const props = defineProps<{
    teamMemberToTeamSlotMap?: Record<string, number>;
}>();

const {
    isLoading,
    error,
    players,
    displayedPlayers,
    onlyInRoom,
    hasRoomPlayers,
    isInRoom,
    rowTeamStyle,
    profileRoute,
    playerKey,
    playerName,
    typeLabel,
    getImagePath,
    getCharacterName,
} = usePlayerList(() => props.teamMemberToTeamSlotMap ?? {});
</script>

<template>
    <div class="player-list">
        <div v-if="isLoading" class="state-message">載入中…</div>
        <div v-else-if="error" class="state-message is-error">{{ error }}</div>
        <div v-else-if="players.length === 0" class="state-message">尚無玩家資料</div>

        <template v-else>
            <label v-if="hasRoomPlayers" class="filter-bar">
                <input v-model="onlyInRoom" type="checkbox" class="switch" />
                <span class="filter-label">只看在場玩家</span>
            </label>

            <div v-if="displayedPlayers.length === 0" class="state-message">目前沒有在場玩家</div>

            <ul v-else class="list">
                <li v-for="player in displayedPlayers" :key="playerKey(player)">
                    <RouterLink v-slot="{ href }" :to="profileRoute(player)" custom>
                        <a
                            class="row"
                            :class="{ 'is-in-room': isInRoom(player) }"
                            :style="rowTeamStyle(player)"
                            :href="href"
                            target="_blank"
                            rel="noopener"
                        >
                            <img
                                v-if="player.signatureCharacter"
                                class="signature-avatar"
                                :src="getImagePath(player.signatureCharacter)"
                                :alt="getCharacterName(player.signatureCharacter)"
                            />
                            <div class="player-content">
                                <div class="info">
                                    <span class="name">{{ playerName(player) }}</span>
                                    <span class="type-badge" :class="`is-${player.teamMember.type.toLowerCase()}`">{{ typeLabel(player) }}</span>
                                </div>

                                <div class="stats">
                                    <span class="stat">{{ player.matchCount }} 場</span>
                                    <span class="stat">{{ player.characterCount }} 名角色</span>
                                </div>
                            </div>
                        </a>
                    </RouterLink>
                </li>
            </ul>
        </template>
    </div>
</template>

<style scoped>
.player-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: var(--space-lg);
}

.filter-bar {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
    user-select: none;
}

.switch {
    position: relative;
    flex-shrink: 0;
    width: calc(var(--base-size) * 2);
    height: calc(var(--base-size) * 1.1);
    border-radius: 999px;
    background-color: var(--md-sys-color-surface-container-highest);
    cursor: pointer;
    transition: background-color 0.2s ease;
    appearance: none;
}

.switch::after {
    content: '';
    position: absolute;
    top: 50%;
    left: calc(var(--base-size) * 0.15);
    width: calc(var(--base-size) * 0.8);
    height: calc(var(--base-size) * 0.8);
    border-radius: 50%;
    background-color: var(--md-sys-color-on-surface-variant);
    transform: translateY(-50%);
    transition:
        transform 0.2s ease,
        background-color 0.2s ease;
}

.switch:checked {
    background-color: var(--md-sys-color-primary);
}

.switch:checked::after {
    background-color: var(--md-sys-color-on-primary);
    transform: translateY(-50%) translateX(calc(var(--base-size) * 0.9));
}

.switch:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
}

.filter-label {
    font-size: var(--font-size-md);
    color: var(--md-sys-color-on-surface-variant);
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

.list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--base-size) * 20), 1fr));
    gap: var(--space-md);
    padding: 0;
    list-style: none;
}

.row {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    height: 100%;
    padding: var(--space-sm) var(--space-md);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-md);
    color: var(--md-sys-color-on-surface);
    text-decoration: none;
    cursor: pointer;
    transition:
        background-color 0.15s ease,
        transform 0.15s ease;
}

.row:hover {
    background-color: var(--md-sys-color-surface-container-high);
    transform: translateY(-2px);
}

.row.is-in-room {
    background-color: color-mix(in srgb, var(--team-color) 12%, var(--md-sys-color-surface-container-low));
    box-shadow: inset 0 0 0 1px var(--team-color);
}

.row.is-in-room:hover {
    background-color: color-mix(in srgb, var(--team-color) 18%, var(--md-sys-color-surface-container-high));
}

.row:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
}

.signature-avatar {
    flex-shrink: 0;
    width: calc(var(--base-size) * 3);
    height: calc(var(--base-size) * 3);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
}

.player-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-sm);
}

.info {
    display: flex;
    flex-direction: row;
    gap: var(--space-sm);
}

.name {
    flex: 1;
    min-width: 0;
    padding-right: calc(var(--base-size) * 4);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.type-badge {
    padding: var(--space-xxs) var(--space-xs);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface-variant);
    background-color: var(--md-sys-color-surface-container-highest);
}

.type-badge.is-member {
    color: var(--md-sys-color-tertiary);
    background-color: color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent);
}

/* .type-badge.is-guest {
    color: var(--md-sys-color-tertiary);
    background-color: color-mix(in srgb, var(--md-sys-color-tertiary) 16%, transparent);
} */

.stats {
    display: flex;
    flex-direction: row;
    gap: var(--space-sm);
}

.stat {
    flex-shrink: 0;
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}
</style>
