// src/modules/banPick/ui/composables/useBanPickFacade.ts
import { storeToRefs } from 'pinia';

import { useBanPickInitializer } from './useBanPickInitializer';
import { useBanPickFilters } from './useBanPickFilters';
import { useBanPickRandomPull } from './useBanPickRandomPull';
import { useBoardImageStore, useBoardSync } from '@/modules/board';
import { useCharacterStore } from '@/modules/character';
import { useTeamInfoSync } from '@/modules/team';
import { useBanPickMatchSave } from './useBanPickMatchSave';

export function useBanPickFacade(roomId: string) {
    const { isLoading: isInitLoading, roomSetting, filteredCharacterKeys, characterFilter } = useBanPickInitializer(roomId);

    const boardImageStore = useBoardImageStore();
    const { boardImageMap, usedImageIds } = storeToRefs(boardImageStore);
    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);
    const { filterChange } = useBanPickFilters(filteredCharacterKeys, characterFilter);

    const { randomPull } = useBanPickRandomPull(roomSetting, filteredCharacterKeys, characterFilter, boardImageMap);

    const { boardImageDrop, boardImageRestore, boardImageMapReset } = useBoardSync();
    const { memberInput, memberDrop, memberRestore } = useTeamInfoSync();
    const { matchSave, result: matchResult, isLoading: isMatchSavingLoading, error: matchSaveError } = useBanPickMatchSave(roomId)
    

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
            imageMapReset: boardImageMapReset,
            randomPull,
        },

        team: {
            memberInput,
            memberDrop,
            memberRestore,
        },

        match: {
            save: matchSave,
            isLoading: isMatchSavingLoading,
            result: matchResult,
            error: matchSaveError,
        }
    };
}
