// src/modules/banPick/ui/composables/useBanPickRandomPull.vue

import { randomPullUseCase, useBoardSync } from '@/modules/board';

import type { Ref } from 'vue';
import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap.ts';
import type { ZoneType } from '@shared/contracts/board/value-types.ts';
import type { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';

export function useBanPickRandomPull(roomSetting: Ref<IRoomSetting | null>, filteredCharacterKeys: Ref<string[]>, characterFilter: Ref<Record<CharacterFilterKey, string[]>>, boardImageMap: Ref<BoardImageMap>) {
    const { randomPull: handleRandomPull } = randomPullUseCase()
    const { boardImageDrop } = useBoardSync()

    function randomPull({ zoneType }: { zoneType: ZoneType }) {
        console.debug(`[BAN PICK VIEW] Handle random pull`, { zoneType });
        if (!roomSetting.value || !filteredCharacterKeys.value || filteredCharacterKeys.value.length === 0) {
            console.warn(`[BAN PICK VIEW] Room is not ready or do not filiter any character`);
            return;
        }
        const result = handleRandomPull(zoneType, roomSetting.value, boardImageMap.value, filteredCharacterKeys.value);
        if (!result) {
            console.warn(`[BAN PICK VIEW] Random pull does not get any result`);
            return;
        }
        const randomContext: ICharacterRandomContext = { characterFilter: characterFilter.value };
        boardImageDrop({ ...result, randomContext });
    }

    return {
        randomPull
    }
}
