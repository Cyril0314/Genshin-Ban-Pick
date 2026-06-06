<!-- src/modules/analysis/ui/components/MatchHistoryModal.vue -->

<script setup lang="ts">
import { computed, toRef } from 'vue';

import { Dices, Swords, X } from '@lucide/vue';
import { useMatchHistoryModal } from '../composables/useMatchHistoryModal';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { useTeamTheme } from '@/modules/shared/ui/composables/useTeamTheme';
import { getWishImagePath } from '@/modules/shared/infrastructure/imageRegistry';
import CharacterHoverCard from './CharacterHoverCard.vue';
import { MoveSource, MoveType } from '@shared/contracts/match/value-types';

import type { IMatchTeam } from '@shared/contracts/match/IMatchTeam';
import type { IMatchTeamMember } from '@shared/contracts/match/IMatchTeamMember';

const props = defineProps<{
    open: boolean;
    matchId?: number;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const { isLoading, error, match, teams, moveColumnsOf, utilityMoves, moveLabel, membersUsing } = useMatchHistoryModal(
    toRef(props, 'open'),
    toRef(props, 'matchId'),
);
const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();

const dateLabel = computed(() => (match.value ? new Date(match.value.createdAt).toLocaleString() : ''));

// 隊伍主題色：依 slot 取，cache 每個 slot 第一次取到的 themeVars，避免每次 render 都新建 computed 造成記憶體累積。
// useTeamTheme 內部會以 slot 0/1 映射到 team-first/team-second，未知 slot fallback first；themeVars 本身無 reactive 依賴，cache 一次即永久有效。
const themeVarsCache = new Map<number, Record<string, string>>();
function themeVarsOf(slot: number) {
    let vars = themeVarsCache.get(slot);
    if (!vars) {
        vars = useTeamTheme(slot).themeVars.value;
        themeVarsCache.set(slot, vars);
    }
    return vars;
}

function teamLabel(team: IMatchTeam, index: number): string {
    return team.name?.trim() || `Team ${String.fromCharCode(65 + index)}`;
}

function moveTypeClass(type: MoveType): string {
    if (type === MoveType.Ban) return 'is-ban';
    if (type === MoveType.Pick) return 'is-pick';
    return 'is-utility';
}

// 將一隊的 lineupSlots 攤平成「成員為欄、setupNumber 為列」的唯讀矩陣
interface LineupView {
    members: IMatchTeamMember[];
    rows: { setupNumber: number; cells: { memberId: number; characterKey?: string }[] }[];
}
function buildLineup(team: IMatchTeam): LineupView {
    const members = [...(team.teamMembers ?? [])].sort((a, b) => a.slot - b.slot);
    const setupSet = new Set<number>();
    members.forEach((m) => m.lineupSlots?.forEach((s) => setupSet.add(s.setupNumber)));
    const setups = [...setupSet].sort((a, b) => a - b);
    const rows = setups.map((setupNumber) => ({
        setupNumber,
        cells: members.map((m) => ({
            memberId: m.id,
            characterKey: m.lineupSlots?.find((s) => s.setupNumber === setupNumber)?.characterKey,
        })),
    }));
    return { members, rows };
}
const hasLineup = (view: LineupView) => view.members.length > 0 && view.rows.length > 0;

// 攤平成純值陣列供 template 走訪，避免在 v-for 中放 ref 造成 unwrap 混淆。
const flowColumns = computed(() =>
    teams.value.map((team, i) => ({
        key: team.id,
        slot: team.slot,
        label: teamLabel(team, i),
        teamId: team.id,
    })),
);

const lineupBlocks = computed(() =>
    teams.value.map((team, i) => ({
        key: team.id,
        slot: team.slot,
        label: teamLabel(team, i),
        view: buildLineup(team),
    })),
);
</script>

<template>
    <n-modal :show="open" :mask-closable="true" @update:show="emit('update:open', $event)">
        <div class="modal-card scale-context">
            <div class="modal-header">
                <div class="header-title">
                    <span class="header-icon">
                        <Swords :size="20" />
                    </span>
                    <div class="header-text">
                        <span class="modal-title">對戰紀錄</span>
                        <span v-if="dateLabel" class="modal-subtitle">{{ dateLabel }}</span>
                    </div>
                </div>
                <n-button text class="close-button" @click="emit('update:open', false)">
                    <template #icon>
                        <X />
                    </template>
                </n-button>
            </div>

            <div class="modal-body">
                <div v-if="isLoading" class="state-message">載入中…</div>
                <div v-else-if="error" class="state-message is-error">{{ error }}</div>
                <div v-else-if="!match" class="state-message">尚無紀錄</div>
                <template v-else>
                    <section class="section">
                        <div class="section-header">
                            <h3 class="section-title">Ban / Pick 流程</h3>
                        </div>

                        <div v-if="utilityMoves.length > 0" class="utility-header">
                            <span class="utility-dot" />
                            <span>自由位</span>
                        </div>

                        <ul v-if="utilityMoves.length > 0" class="utility-list">
                            <li v-for="m in utilityMoves" :key="m.id" class="move-row is-utility-row">
                                <div class="move-thumb">
                                    <CharacterHoverCard :character-key="m.characterKey">
                                        <img class="move-avatar" :src="getWishImagePath(m.characterKey)"
                                            :alt="getCharacterDisplayName(m.characterKey)" />
                                    </CharacterHoverCard>
                                    <span class="move-badge is-utility">{{ moveLabel(m) }}</span>
                                    <span v-if="m.source === MoveSource.Random" class="random-mark" title="隨機選取">
                                        <Dices />
                                    </span>
                                </div>
                                <div class="move-text">
                                    <span class="move-name">{{ getCharacterDisplayName(m.characterKey) }}</span>
                                    <span v-if="membersUsing(m.characterKey).length > 0" class="move-member">
                                        {{membersUsing(m.characterKey).map((mem) => mem.name).join('、')}}
                                    </span>
                                </div>
                            </li>
                        </ul>

                        <div class="flow-grid">
                            <div v-for="col in flowColumns" :key="col.key" class="flow-column"
                                :style="themeVarsOf(col.slot)">
                                <div class="flow-column-header">
                                    <span class="team-dot" />
                                    <span class="team-name">{{ col.label }}</span>
                                </div>
                                <div class="move-columns">
                                    <ul v-for="(moves, ci) in moveColumnsOf(col.teamId)" :key="ci" class="move-list">
                                        <li v-for="m in moves" :key="m.id" class="move-row"
                                            :class="moveTypeClass(m.type)">
                                            <div class="move-thumb">
                                                <CharacterHoverCard :character-key="m.characterKey">
                                                    <img class="move-avatar" :src="getWishImagePath(m.characterKey)"
                                                        :alt="getCharacterDisplayName(m.characterKey)" />
                                                </CharacterHoverCard>
                                                <span class="move-badge" :class="moveTypeClass(m.type)">{{ moveLabel(m)
                                                    }}</span>
                                                <span v-if="m.source === MoveSource.Random" class="random-mark"
                                                    title="隨機選取">
                                                    <Dices :size="12" />
                                                </span>
                                            </div>
                                            <div class="move-text">
                                                <span class="move-name">{{ getCharacterDisplayName(m.characterKey)
                                                    }}</span>
                                                <span v-if="membersUsing(m.characterKey, col.teamId).length > 0"
                                                    class="move-member">
                                                    {{membersUsing(m.characterKey, col.teamId).map((mem) =>
                                                    mem.name).join('、') }}
                                                </span>
                                                <span v-else-if="m.type === MoveType.Pick"
                                                    class="move-swapped">換自由位</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- 隊伍編排（lineupSlots） -->
                    <section class="section">
                        <div class="section-header">
                            <h3 class="section-title">隊伍編排</h3>
                        </div>

                        <div class="lineup-grid">
                            <div v-for="block in lineupBlocks" :key="block.key" class="lineup-block"
                                :style="themeVarsOf(block.slot)">
                                <div class="lineup-block-header">
                                    <span class="team-dot" />
                                    <span class="team-name">{{ block.label }}</span>
                                </div>
                                <template v-if="hasLineup(block.view)">
                                    <div class="lineup-members">
                                        <span class="lineup-setup-label" />
                                        <span v-for="m in block.view.members" :key="m.id" class="lineup-member-name">{{
                                            m.name }}</span>
                                    </div>
                                    <div v-for="row in block.view.rows" :key="row.setupNumber" class="lineup-row">
                                        <span class="lineup-setup-label">{{ row.setupNumber }}</span>
                                        <div v-for="cell in row.cells" :key="cell.memberId" class="lineup-cell">
                                            <CharacterHoverCard v-if="cell.characterKey"
                                                :character-key="cell.characterKey">
                                                <img class="lineup-avatar" :src="getWishImagePath(cell.characterKey)"
                                                    :alt="getCharacterDisplayName(cell.characterKey)" />
                                            </CharacterHoverCard>
                                            <span v-else class="lineup-empty" />
                                        </div>
                                    </div>
                                </template>
                                <div v-else class="state-message">無編排資料</div>
                            </div>
                        </div>
                    </section>
                </template>
            </div>
        </div>
    </n-modal>
</template>

<style scoped>
.modal-card {
    width: 72vw;
    max-width: calc(var(--base-size) * 62);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    background-color: var(--md-sys-color-surface-container-high);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
}

.modal-header {
    display: flex;
    align-items: center;
    padding: var(--space-lg);
    justify-content: space-between;
    background: linear-gradient(135deg, var(--md-sys-color-surface-container-high), var(--md-sys-color-surface-container));
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.header-title {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    min-width: 0;
}

.header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--base-size) * 2);
    height: calc(var(--base-size) * 2);
    border-radius: var(--radius-md);
    background-color: color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent);
    color: var(--md-sys-color-primary);
    flex-shrink: 0;
}

.header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.modal-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
    line-height: 1.15;
}

.modal-subtitle {
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.close-button {
    color: var(--md-sys-color-on-surface-variant);
}

/* ---- 共用：隊伍色標題 ---- */
.team-dot {
    width: calc(var(--base-size) * 0.55);
    height: calc(var(--base-size) * 0.55);
    border-radius: 50%;
    background-color: var(--team-color);
    flex-shrink: 0;
}

.team-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.modal-body {
    overflow-y: auto;
    min-height: 0;
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
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
    gap: var(--space-md);
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

/* ---- Ban / Pick 流程 ---- */
.flow-grid {
    display: flex;
    gap: var(--space-lg);
    align-items: stretch;
}

.flow-column {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: var(--space-sm);
    min-width: 0;
}

.flow-column-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
    padding-bottom: var(--space-xs);
    border-bottom: 2px solid color-mix(in srgb, var(--team-color) 60%, transparent);
}

.utility-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
    padding-bottom: var(--space-xs);
    border-bottom: 2px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
}

.utility-dot {
    width: calc(var(--base-size) * 0.55);
    height: calc(var(--base-size) * 0.55);
    border-radius: 50%;
    background-color: var(--md-sys-color-on-surface-variant);
    flex-shrink: 0;
}

.move-columns {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
}

.move-columns>.move-list {
    flex: 1 1 0;
    min-width: 0;
}

.move-list,
.utility-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: 0;
    list-style: none;
}

.utility-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-sm);
    padding-bottom: var(--space-sm);
    border-bottom: 1px dashed var(--md-sys-color-outline-variant);
}

.utility-list>.move-row {
    flex: 1 1 0;
    min-width: 0;
}

.move-row {
    --size-move-avatar: calc(var(--base-size) * 5);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    border-left: 3px solid transparent;
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    transition:
        transform 0.15s ease,
        background-color 0.15s ease;
}

.move-thumb {
    position: relative;
    flex-shrink: 0;
    line-height: 0;
}

.random-mark {
    position: absolute;
    top: var(--space-xxs);
    right: var(--space-xxs);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xxs);
    border-radius: var(--radius-sm);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    pointer-events: none;
}

.random-mark svg {
    width: calc(var(--base-size));
    height: calc(var(--base-size));
}

.move-row:hover {
    transform: translateX(2px);
    background-color: var(--md-sys-color-surface-container);
}

.move-row.is-pick {
    border-left-color: var(--team-color);
}

.move-row.is-ban {
    border-left-color: color-mix(in srgb, var(--md-sys-color-error) 70%, transparent);
}

.move-row.is-ban .move-avatar {
    filter: grayscale(1);
    opacity: 0.5;
}

.move-row.is-ban .move-name {
    color: var(--md-sys-color-on-surface-variant);
    text-decoration: line-through;
    text-decoration-color: color-mix(in srgb, var(--md-sys-color-error) 60%, transparent);
}

.move-badge {
    position: absolute;
    bottom: var(--space-xxs);
    left: var(--space-xxs);
    padding: var(--space-xxs);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    line-height: 1.2;
    backdrop-filter: blur(2px);
    background-color: color-mix(in srgb, var(--md-sys-color-surface) 70%, transparent);
    color: var(--md-sys-color-on-surface-variant);
    pointer-events: none;
}

.move-badge.is-ban {
    color: var(--md-sys-color-error);
}

.move-badge.is-pick {
    color: var(--md-sys-color-on-surface);
}

.move-badge.is-utility {
    color: var(--md-sys-color-on-surface-variant);
}

.move-avatar {
    width: var(--size-move-avatar);
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-sm);
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    flex-shrink: 0;
}

.move-text {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-xs) / 2);
    min-width: 0;
    overflow: hidden;
}

.move-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.move-member {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.move-swapped {
    align-self: flex-start;
    padding: 0 var(--space-xs);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-tertiary);
    background-color: color-mix(in srgb, var(--md-sys-color-tertiary) 18%, transparent);
}

.move-row.is-utility-row {
    background-color: var(--md-sys-color-surface-container);
    border-left-color: var(--md-sys-color-outline-variant);
}

/* ---- 隊伍編排 ---- */
.lineup-grid {
    display: flex;
    gap: var(--space-lg);
    align-items: stretch;
}

.lineup-block {
    --size-lineup-img-w: calc(var(--base-size) * 5);
    --size-lineup-setup: calc(var(--base-size) * 1.6);
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-md);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--team-color);
    min-width: 0;
    overflow-x: auto;
}

.lineup-block-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
}

.lineup-members {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.lineup-member-name {
    width: var(--size-lineup-img-w);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface-variant);
}

.lineup-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.lineup-setup-label {
    width: var(--size-lineup-setup);
    flex-shrink: 0;
    text-align: center;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--team-surface-tinted);
}

.lineup-cell {
    width: var(--size-lineup-img-w);
    aspect-ratio: 16 / 9;
    flex-shrink: 0;
}

.lineup-avatar {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--radius-sm);
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    border: 1px solid transparent;
    transition:
        transform 0.15s ease,
        border-color 0.15s ease;
}

.lineup-avatar:hover {
    transform: translateY(-2px);
    border-color: var(--team-color);
}

.lineup-empty {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--radius-sm);
    background-color: var(--md-sys-color-surface-container);
    border: 1px dashed var(--md-sys-color-outline-variant);
    opacity: 0.5;
}
</style>
