// src/modules/player/ui/composables/usePlayerList.ts

import { toPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import { getTeamMemberName } from '@shared/contracts/team/TeamMember';
import { computed, onMounted, ref, toValue } from 'vue';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IPlayerSummary } from '@shared/contracts/player/IPlayerSummary';
import type { MaybeRefOrGetter } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import { createLogger } from '@/app/utils/logger';
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry';
import { getTeamTheme } from '@/modules/shared/ui/composables/getTeamTheme';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';

import { usePlayerUseCase } from './usePlayerUseCase';

const logger = createLogger('player.ui.list');

const TYPE_LABELS: Record<PlayerIdentity['type'], string> = {
    Member: '會員',
    Guest: '訪客',
    Name: '歷史',
};

export function usePlayerList(teamMemberToTeamSlotMap?: MaybeRefOrGetter<Record<string, number>>) {
    const playerUseCase = usePlayerUseCase();
    const { getByKey: getCharacterName } = useCharacterDisplayName();

    const isLoading = ref(false);
    const error = ref<string>();
    const players = ref<IPlayerSummary[]>([]);

    const onlyInRoom = ref(false);

    async function load() {
        isLoading.value = true;
        error.value = undefined;
        try {
            players.value = await playerUseCase.fetchPlayers();
        } catch (e: any) {
            error.value = e?.response?.data?.message ?? e?.message ?? '載入失敗';
            logger.error('fetch players failed', e);
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(load);

    // ---- 顯示輔助 ----
    // 導航到 PlayerProfileView 整頁（route）的 to 物件，交給 <RouterLink> 渲染成真正的 <a>
    const profileRoute = (player: IPlayerSummary): RouteLocationRaw => ({
        name: 'PlayerProfile',
        query: { ...toPlayerIdentityQuery(player.teamMember) },
    });
    const playerKey = (player: IPlayerSummary) => stringifyPlayerIdentity(player.teamMember);
    const playerName = (player: IPlayerSummary) => getTeamMemberName(player.teamMember);
    const typeLabel = (player: IPlayerSummary) => TYPE_LABELS[player.teamMember.type];
    // 該玩家在當前房間所屬的隊伍 slot；不在場上則為 undefined
    const teamSlotOf = (player: IPlayerSummary): number | undefined => toValue(teamMemberToTeamSlotMap)?.[playerKey(player)];
    const isInRoom = (player: IPlayerSummary): boolean => teamSlotOf(player) !== undefined;
    // 在場玩家依所屬隊伍帶入 team 主題色 CSS vars（--team-color…）；不在場上回 undefined（不套 style）
    const rowTeamStyle = (player: IPlayerSummary): Record<string, string> | undefined => {
        const slot = teamSlotOf(player);
        return slot === undefined ? undefined : getTeamTheme(slot).themeVars;
    };

    // 房間是否有在場玩家 → 決定是否顯示「只看在場玩家」toggle
    const hasRoomPlayers = computed(() => Object.keys(toValue(teamMemberToTeamSlotMap) ?? {}).length > 0);

    // 過濾 / 排序後實際渲染的清單：
    //  - onlyInRoom 開 → 只留在場玩家
    //  - onlyInRoom 關 → 在場玩家浮到最上方（群組內維持後端 matchCount 排序）
    const displayedPlayers = computed<IPlayerSummary[]>(() => {
        const all = players.value;
        if (onlyInRoom.value) return all.filter(isInRoom);
        const inRoom = all.filter(isInRoom);
        if (inRoom.length === 0) return all;
        return [...inRoom, ...all.filter((player) => !isInRoom(player))];
    });

    return {
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
        getImagePath: getProfileImagePath,
        getCharacterName,
    };
}
