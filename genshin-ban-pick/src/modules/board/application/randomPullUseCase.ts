// src/modules/board/application/randomPullUseCase.ts

import { findNextMatchStepZoneIdDomain } from '../domain/findNextMatchStepZoneIdDomain';
import { pickRandomImageDomain } from '../domain/pickRandomImageDomain';
import { getAvailableImageIdsDomain } from '../domain/getAvailableImageIdsDomain';

import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting';
import type { ZoneType } from '@shared/contracts/board/value-types';

export function randomPullUseCase() {
    function randomPull(
        zoneType: ZoneType,
        roomSetting: IRoomSetting,
        boardImageMap: Record<number, string>,
        filteredCharacterKeys: string[],
    ): { zoneId: number; imgId: string } | null {
        const zoneId = findNextMatchStepZoneIdDomain(zoneType, roomSetting.matchFlow.steps, roomSetting.zoneMetaTable, boardImageMap);
        const availableImageIds = getAvailableImageIdsDomain(boardImageMap, filteredCharacterKeys);
        const randomImgId = pickRandomImageDomain(availableImageIds);
        if (zoneId === null || randomImgId === null) return null;
        console.debug(`[RANDOM PULL] Get random image ${randomImgId} and find drop zoneId ${zoneId}`);
        return { zoneId, imgId: randomImgId };
    }

    return { randomPull };
}
