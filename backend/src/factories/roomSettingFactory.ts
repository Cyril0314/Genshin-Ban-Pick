// backend/src/factories/roomSettingFactory.ts

import {
    numberOfUtility,
    numberOfBan,
    numberOfPick,
    maxNumberOfUtilityPerColumn,
    maxNumberOfBanPerRow,
    maxNumberOfPickPerColumn,
    totalRounds,
    teams,
} from '../constants/constants.ts';
import { createZoneSchema } from '../utils/zoneSchema.ts';
import { generateBanPickSteps } from '../utils/banPickSteps.ts';

export function createRoomSetting() {
    const zoneSchema = createZoneSchema({
        numberOfUtility,
        maxNumberOfUtilityPerColumn,
        numberOfBan,
        maxNumberOfBanPerRow,
        numberOfPick,
        maxNumberOfPickPerColumn,
        totalRounds,
    });
    const banPickSteps = generateBanPickSteps(zoneSchema.banZones, zoneSchema.leftPickZones, zoneSchema.rightPickZones, totalRounds, teams);

    return {
        zoneSchema,
        banPickSteps,
        teams,
    };
}
