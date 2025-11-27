// src/modules/banPick/ui/composables/useBanPickInitializer.ts

import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { roomUseCase, useRoomUserSync } from '@/modules/room';
import { characterUseCase, useCharacterStore } from '@/modules/character';
import { boardUseCase, matchStepUseCase } from '@/modules/board';
import { teamUseCase } from '@/modules/team';
import { tacticalUseCase } from '@/modules/tactical';

import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting.ts';
import type { CharacterFilterKey } from '@shared/contracts/character/value-types';

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
    const { fetchRoomSetting } = roomUseCase();
    const { fetchCharacterMap } = characterUseCase();
    const { initZoneMetaTable } = boardUseCase();
    const { initTeams } = teamUseCase();
    const { initMatchSteps } = matchStepUseCase();
    const { initTeamTacticalCellImageMap } = tacticalUseCase();

    const { joinRoom, leaveRoom } = useRoomUserSync();

    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    // --- initializer ---
    onMounted(async () => {
        try {
            // 1. 抓全部角色
            await fetchCharacterMap();

            // 2. 抓房間設定
            roomSetting.value = await fetchRoomSetting(roomId);

            // 3. 初始化 Board / Team / Flow
            if (roomSetting.value) {
                initZoneMetaTable(roomSetting.value.zoneMetaTable);
                initTeams(roomSetting.value.teams);
                initMatchSteps(roomSetting.value.matchFlow.steps);
                initTeamTacticalCellImageMap(roomSetting.value.teams, roomSetting.value.numberOfTeamSetup, roomSetting.value.numberOfSetupCharacter);
            }

            // 4. 初始化 Filter 預設值
            filteredCharacterKeys.value = Object.keys(characterMap.value);

            // 5. 加入 socket 房間
            joinRoom(roomId);
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
