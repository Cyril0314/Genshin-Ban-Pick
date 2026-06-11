// src/modules/match/ui/composables/useMatchHistoryModal.ts

import { MoveType } from '@shared/contracts/match/value-types';
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchMove } from '@shared/contracts/match/IMatchMove';
import type { IMatchTeam } from '@shared/contracts/match/IMatchTeam';
import type { IMatchTeamMember } from '@shared/contracts/match/IMatchTeamMember';

import { createLogger } from '@/app/utils/logger';
import { useMatchUseCase } from '@/modules/match';
import { getTeamTheme } from '@/modules/shared/ui/composables/getTeamTheme';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { chunk } from '@/modules/shared/utils/array';



const logger = createLogger('analysis.ui.matchHistory');

// 與 useBoardZonesLayout.maxNumberOfPickPerColumn 對齊：一欄最多 8 個 Pick，超過自動換欄。
const MAX_PICKS_PER_COLUMN = 8;

const byOrder = (a: IMatchMove, b: IMatchMove) => a.order - b.order;

export function useMatchHistoryModal(open: MaybeRefOrGetter<boolean>, matchId: MaybeRefOrGetter<number | undefined>) {
    const matchUseCase = useMatchUseCase();
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();

    const isLoading = ref(false);
    const match = ref<IMatch | undefined>(undefined);
    const error = ref<string | undefined>(undefined);

    watch([() => toValue(open), () => toValue(matchId)], async ([isOpen, id], _old, onCleanup) => {
        if (!isOpen || id === undefined) return;
        // 用旗標處理 race：當 matchId 連續變動（例如使用者快速點不同 scatter），
        // 舊請求的 await 回來時 stale 為 true，直接放棄，不覆蓋新請求的結果。
        let stale = false;
        onCleanup(() => {
            stale = true;
        });

        isLoading.value = true;
        error.value = undefined;
        match.value = undefined;
        try {
            const result = await matchUseCase.fetchMatch(id);
            if (stale) return;
            match.value = result;
        } catch (e: any) {
            if (stale) return;
            error.value = e?.response?.data?.message ?? e?.message ?? '載入失敗';
            logger.error('fetch failed', e);
        } finally {
            if (!stale) isLoading.value = false;
        }
    });

    // 依 slot 升冪輸出當前比賽的所有隊伍，欄數不寫死。
    const teams = computed<IMatchTeam[]>(() => [...(match.value?.teams ?? [])].sort((a, b) => a.slot - b.slot));

    // 該隊的 Ban/Pick moves，切成 column-major 二維陣列（呼應 board 排版）：
    // Pick 依 MAX_PICKS_PER_COLUMN 分欄，Ban 平均分配到各欄並排在欄首。
    function moveColumnsOf(teamId: number | undefined): IMatchMove[][] {
        if (teamId === undefined) return [];
        const teamMoves = (match.value?.moves ?? []).filter((m) => m.teamId === teamId);
        const bans = teamMoves.filter((m) => m.type === MoveType.Ban).sort(byOrder);
        const picks = teamMoves.filter((m) => m.type === MoveType.Pick).sort(byOrder);

        const pickColumns = picks.length > 0 ? chunk(picks, MAX_PICKS_PER_COLUMN) : bans.length > 0 ? [[] as IMatchMove[]] : [];
        if (pickColumns.length === 0) return [];

        const bansPerColumn = Math.ceil(bans.length / pickColumns.length);
        return pickColumns.map((picksInColumn, i) => {
            const bansInColumn = bans.slice(i * bansPerColumn, (i + 1) * bansPerColumn);
            return [...bansInColumn, ...picksInColumn];
        });
    }

    // 無隊伍歸屬的 moves（Utility），跨欄整列呈現
    const utilityMoves = computed<IMatchMove[]>(() => (match.value?.moves ?? []).filter((m) => m.teamId === undefined).sort(byOrder));

    // 對齊盤面 zone 的標號（Ban 1 / Pick 1 / Utility 1）：依 order 在同 type 內累加，
    // 不直接顯示 move.order。參考 useBoardZonesLayout / BanZones、PickZones 的 `${Type} ${zone.order + 1}`。
    const moveLabels = computed(() => {
        const map = new Map<number, string>();
        const counters: Record<string, number> = {};
        [...(match.value?.moves ?? [])].sort(byOrder).forEach((m) => {
            // Utility 不帶序號，只顯示 type；Ban/Pick 依同 type 累加標號。
            if (m.type === MoveType.Utility) {
                map.set(m.id, m.type);
                return;
            }
            counters[m.type] = (counters[m.type] ?? 0) + 1;
            map.set(m.id, `${m.type} ${counters[m.type]}`);
        });
        return map;
    });

    function moveLabel(m: IMatchMove): string {
        return moveLabels.value.get(m.id) ?? m.type;
    }

    // 找所有 lineupSlots 用到這個 characterKey 的 team member（utility 可能跨人/跨隊命中）；
    // teamId 限定隊內查（Ban/Pick），略過則跨全部隊伍查（Utility）。
    function membersUsing(characterKey: string, teamId?: number): IMatchTeamMember[] {
        const scope = teamId === undefined ? teams.value : teams.value.filter((t) => t.id === teamId);
        return scope.flatMap((team) => team.teamMembers?.filter((m) => m.lineupSlots?.some((s) => s.characterKey === characterKey)) ?? []);
    }

    // ---- View shape ----

    const dateLabel = computed(() => (match.value ? new Date(match.value.createdAt).toLocaleString() : ''));

    function teamLabel(team: IMatchTeam, index: number): string {
        return team.name?.trim() || `Team ${String.fromCharCode(65 + index)}`;
    }

    function moveTypeClass(type: MoveType): string {
        if (type === MoveType.Ban) return 'is-ban';
        if (type === MoveType.Pick) return 'is-pick';
        return 'is-utility';
    }

    // getTeamTheme 是 module-level 靜態查表（每個 slot 全 app 共用同一 themeVars 物件），直接呼叫即可。
    function themeVarsOf(slot: number) {
        return getTeamTheme(slot).themeVars;
    }

    // 將一隊的 lineupSlots 攤平成「成員為欄、setupNumber 為列」的唯讀矩陣
    interface ILineupView {
        members: IMatchTeamMember[];
        rows: { setupNumber: number; cells: { memberId: number; characterKey?: string }[] }[];
    }

    function buildLineup(team: IMatchTeam): ILineupView {
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

    const hasLineup = (view: ILineupView) => view.members.length > 0 && view.rows.length > 0;

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

    return {
        isLoading,
        error,
        match,
        moveColumnsOf,
        utilityMoves,
        moveLabel,
        membersUsing,
        dateLabel,
        themeVarsOf,
        moveTypeClass,
        hasLineup,
        flowColumns,
        lineupBlocks,
        getCharacterDisplayName,
    };
}
