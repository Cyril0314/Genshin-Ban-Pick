// src/modules/banPick/ui/composables/useBanPickInitializer.ts

import { ref, shallowRef, onMounted, onUnmounted, inject } from 'vue';
import { storeToRefs } from 'pinia';

import { roomUseCase, useRoomUserSync } from '@/modules/room';
import { useCharacterStore, useCharacterUseCase } from '@/modules/character';
import { useBoardUseCase, matchStepUseCase, useBoardSync, useMatchStepSync } from '@/modules/board';
import { teamUseCase, useTeamInfoSync } from '@/modules/team';
import { tacticalUseCase } from '@/modules/tactical';
import { useChatSync } from '@/modules/chat';
import { registerAllSyncModules } from '@/app/bootstrap/registerAllSyncModules';

import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting.ts';
import type { CharacterFilterKey } from '@shared/contracts/character/value-types';
import { useSocketStore } from '@/app/stores/socketStore';

export function useBanPickInitializer(roomId: string) {
    // --- states ---
    const isLoading = ref(true);
    const roomSetting = shallowRef<IRoomSetting | null>(null);

    const filteredCharacterKeys = ref<string[]>([]);
    const characterFilter = ref<Record<CharacterFilterKey, string[]>>({
        weapon: [],
        element: [],
        region: [],
        rarity: [],
        modelType: [],
        role: [],
        wish: [],
    });
    // --- use cases ---
    const characterUseCase = useCharacterUseCase();
    const boardUseCase = useBoardUseCase();
    const { fetchRoomSetting } = roomUseCase();
    const { initTeams } = teamUseCase();
    const { initMatchSteps } = matchStepUseCase();
    const { initTeamTacticalCellImageMap } = tacticalUseCase();

    const { joinRoom, leaveRoom } = useRoomUserSync();
    const { fetchBoardImageMapState } = useBoardSync();
    const { fetchMatchStepState } = useMatchStepSync();
    const { fetchChatState } = useChatSync();
    const { fetchMembersMapState } = useTeamInfoSync();

    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    // --- initializer ---
    onMounted(async () => {
        try {
            const socket = useSocketStore();
            registerAllSyncModules(socket.getSocket())

            // 1. 抓全部角色
            await characterUseCase.fetchCharacterMap();

            // 2. 抓房間設定
            roomSetting.value = await fetchRoomSetting(roomId);

            // 3. 初始化 Board / Team / Flow
            if (roomSetting.value) {
                boardUseCase.initZoneMetaTable(roomSetting.value.zoneMetaTable);
                initTeams(roomSetting.value.teams);
                initMatchSteps(roomSetting.value.matchFlow.steps);
                initTeamTacticalCellImageMap(roomSetting.value.teams, roomSetting.value.numberOfTeamSetup, roomSetting.value.numberOfSetupCharacter);
            }

            // 4. 初始化 Filter 預設值
            filteredCharacterKeys.value = Object.keys(characterMap.value);

            // 5. 加入 socket 房間
            joinRoom(roomId).then(() => {
                console.debug('[BAN PICK INITEALIZER] Joined room', roomId);
                fetchBoardImageMapState();
                fetchMatchStepState();
                fetchChatState();
                fetchMembersMapState();
            });
        } catch (error) {
            console.error('[BAN PICK INITEALIZER] Fetched character and room setting failed:', error);
        } finally {
            isLoading.value = false;
        }
    });

    // --- cleanup ---
    onUnmounted(() => {
        leaveRoom(roomId);
    });

    return {
        isLoading,
        roomSetting,
        filteredCharacterKeys,
        characterFilter,
        leaveRoom,
    };
}
