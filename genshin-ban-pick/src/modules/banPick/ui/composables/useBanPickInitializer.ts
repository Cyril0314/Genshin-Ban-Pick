// src/modules/banPick/ui/composables/useBanPickInitializer.ts

import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/app/stores/socketStore';
import { useRoomUseCase, useRoomUserSync } from '@/modules/room';
import { useCharacterStore, useCharacterUseCase } from '@/modules/character';
import { useBoardUseCase, useBoardSync } from '@/modules/board';
import { useTeamUseCase, useTeamInfoSync } from '@/modules/team';
import { useLineupUseCase } from '@/modules/lineup';
import { useChatSync } from '@/modules/chat';
import { registerAllSyncModules } from '@/app/bootstrap/registerAllSyncModules';

import { createLogger } from '@/app/utils/logger';

import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting.ts';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';

const logger = createLogger('banPick.ui.init');

export function useBanPickInitializer(roomId: string) {
    // --- states ---
    const isLoading = ref(true);
    const roomSetting = shallowRef<IRoomSetting>();

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
    const roomUseCase = useRoomUseCase();
    const tamUseCase = useTeamUseCase();
    const lineupUseCase = useLineupUseCase();

    const { joinRoom, leaveRoom } = useRoomUserSync();
    const { fetchBoardImageMapState } = useBoardSync();
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
            await characterUseCase.loadCharacterMap();

            // 2. 抓房間設定
            roomSetting.value = await roomUseCase.fetchRoomSetting(roomId);

            // 3. 初始化 Board / Team / Flow
            if (roomSetting.value) {
                boardUseCase.initZoneMetaTableAndSteps(roomSetting.value.zoneMetaTable, roomSetting.value.matchFlow.steps);
                tamUseCase.initTeams(roomSetting.value.teams);
                lineupUseCase.initTeamLineupImageMap(roomSetting.value.teams, roomSetting.value.numberOfTeamSetup, roomSetting.value.numberOfSetupCharacter);
            }

            // 4. 初始化 Filter 預設值
            filteredCharacterKeys.value = Object.keys(characterMap.value);

            // 5. 加入 socket 房間
            joinRoom(roomId).then(() => {
                logger.debug('joined room', roomId);
                fetchBoardImageMapState();
                fetchChatState();
                fetchMembersMapState();
            });
        } catch (error) {
            logger.error('init failed:', error);
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
