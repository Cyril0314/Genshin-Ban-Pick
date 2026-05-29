// src/modules/banPick/ui/composables/useBanPickFacade.ts
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useBanPickInitializer } from './useBanPickInitializer';
import { useBanPickFilters } from './useBanPickFilters';
import { useBanPickRandomPull } from './useBanPickRandomPull';
import { useBoardStore, useBoardSync } from '@/modules/board';
import { useCharacterStore } from '@/modules/character';
import { useTeamInfoStore, useTeamInfoSync } from '@/modules/team';
import { buildUserToTeamSlotMap } from '@/modules/team/domain/buildUserToTeamSlotMap';
import { useBanPickMatchSave } from './useBanPickMatchSave';
import { useLineupSync } from '@/modules/lineup';

export function useBanPickFacade(roomId: string) {
    const { isLoading: isInitLoading, roomSetting, filteredCharacterKeys, characterFilter } = useBanPickInitializer(roomId);

    const boardStore = useBoardStore();
    const { boardImageMap, usedImageIds } = storeToRefs(boardStore);
    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);
    const { filterChange } = useBanPickFilters(filteredCharacterKeys, characterFilter);

    const { randomPull } = useBanPickRandomPull(roomSetting, filteredCharacterKeys, characterFilter, boardImageMap);

    const { boardImageDrop, boardImageRestore, boardImageMapReset } = useBoardSync();

    const teamInfoStore = useTeamInfoStore();
    const { teamMembersMap } = storeToRefs(teamInfoStore);
    const userToTeamSlotMap = computed(() => buildUserToTeamSlotMap(teamMembersMap.value));
    const { memberInput, memberDrop, memberRestore } = useTeamInfoSync();

    const { allTeamLineupImageMapReset } = useLineupSync();

    const { matchSave, result: matchResult, isLoading: isMatchSavingLoading, error: matchSaveError } = useBanPickMatchSave(roomId);

    function matchReset() {
        boardImageMapReset();
        allTeamLineupImageMapReset();
    }

    return {
        // state
        state: {
            isInitLoading,
            roomSetting,
            characterMap,
            filteredCharacterKeys,
        },

        filter: {
            change: filterChange,
        },

        board: {
            imageMap: boardImageMap,
            usedImageIds,
            imageDrop: boardImageDrop,
            imageRestore: boardImageRestore,
            randomPull,
        },

        team: {
            userToTeamSlotMap,
            memberInput,
            memberDrop,
            memberRestore,
        },

        match: {
            save: matchSave,
            reset: matchReset,
            isLoading: isMatchSavingLoading,
            result: matchResult,
            error: matchSaveError,
        },
    };
}
