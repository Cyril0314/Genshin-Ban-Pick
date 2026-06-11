// src/views/banPick/composables/useBanPickRandomPull.ts

import { randomPullUseCase, useBoardSync } from '@/modules/board';
import { createLogger } from '@/app/utils/logger';

import type { Ref } from 'vue';
import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap.ts';
import type { ZoneType } from '@shared/contracts/board/value-types.ts';
import type { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';

const logger = createLogger('banPick.randomPull');

export function useBanPickRandomPull(roomSetting: Ref<IRoomSetting | undefined>, filteredCharacterKeys: Ref<string[]>, characterFilter: Ref<Record<CharacterFilterKey, string[]>>, boardImageMap: Ref<BoardImageMap>) {
    const { randomPull: handleRandomPull } = randomPullUseCase()
    const { boardImageDrop } = useBoardSync()

    function randomPull({ zoneType }: { zoneType: ZoneType }) {
        logger.debug('handle random pull', { zoneType });
        if (!roomSetting.value || !filteredCharacterKeys.value || filteredCharacterKeys.value.length === 0) {
            logger.warn('room not ready or no characters match filter');
            return;
        }
        const result = handleRandomPull(zoneType, roomSetting.value, boardImageMap.value, filteredCharacterKeys.value);
        if (!result) {
            logger.warn('random pull returned no result');
            return;
        }
        const randomContext: ICharacterRandomContext = { characterFilter: characterFilter.value };
        boardImageDrop({ ...result, randomContext });
    }

    return {
        randomPull
    }
}
