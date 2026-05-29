// src/modules/board/application/randomPullUseCase.ts

import { createLogger } from '@/app/utils/logger';
import { findNextMatchStepZoneIdDomain } from '../domain/findNextMatchStepZoneIdDomain';
import { pickRandomImageDomain } from '../domain/pickRandomImageDomain';
import { getAvailableImageIdsDomain } from '../domain/getAvailableImageIdsDomain';

import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting';
import type { ZoneType } from '@shared/contracts/board/value-types';

const logger = createLogger('board.application.randomPull');

export function randomPullUseCase() {
    function randomPull(
        zoneType: ZoneType,
        roomSetting: IRoomSetting,
        boardImageMap: Record<number, string>,
        filteredCharacterKeys: string[],
    ): { zoneId: number; imgId: string } | undefined {
        const zoneId = findNextMatchStepZoneIdDomain(zoneType, roomSetting.matchFlow.steps, roomSetting.zoneMetaTable, boardImageMap);
        const availableImageIds = getAvailableImageIdsDomain(boardImageMap, filteredCharacterKeys);
        const randomImgId = pickRandomImageDomain(availableImageIds);
        if (zoneId === undefined || randomImgId === undefined) return undefined;
        logger.debug(`get random image ${randomImgId} for zoneId ${zoneId}`);
        return { zoneId, imgId: randomImgId };
    }

    return { randomPull };
}
