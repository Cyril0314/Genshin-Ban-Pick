// src/modules/board/application/randomPullUseCase.ts

import type { IRoomSetting } from '@/modules/room';
import type { ZoneType } from '../types/IZone';
import { findNextMatchStepZoneId } from '../domain/findNextMatchStepZoneId';
import { pickRandom } from '../domain/pickRandomImage';
import { getAvailableImageIds } from '../domain/getAvailableImageIds';

export function randomPullUseCase() {
    function randomPull(
        zoneType: ZoneType,
        roomSetting: IRoomSetting,
        boardImageMap: Record<number, string>,
        filteredCharacterKeys: string[],
    ): { zoneId: number; imgId: string } | null {
        const zoneId = findNextMatchStepZoneId(zoneType, roomSetting.matchFlow.steps, roomSetting.zoneMetaTable, boardImageMap);
        const availableImageIds = getAvailableImageIds(boardImageMap, filteredCharacterKeys);
        const randomImgId = pickRandom(availableImageIds);
        if (zoneId === null || randomImgId === null) return null;
        console.debug(`[RANDOM PULL] Get random image ${randomImgId} and find drop zoneId ${zoneId}`);
        return { zoneId, imgId: randomImgId };
    }

    return { randomPull }
}
