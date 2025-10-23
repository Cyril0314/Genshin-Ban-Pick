// backend/src/factories/roomSettingFactory.ts

import {
    numberOfUtility,
    numberOfBan,
    numberOfPick,
    maxPerUtilityColumn,
    maxPerBanRow,
    maxPerPickColumn,
    totalRounds,
    teams,
} from '../constants/constants.ts';
import { createZoneSchema } from '../utils/zoneSchema.ts';
import { generateBanPickSteps } from '../utils/banPickSteps.ts';

export function createRoomSetting() {
    const zoneSchema = createZoneSchema({
        numberOfUtility,
        maxPerUtilityColumn,
        numberOfBan,
        maxPerBanRow,
        numberOfPick,
        maxPerPickColumn,
        totalRounds,
    });
    const banPickSteps = generateBanPickSteps(zoneSchema.banZones, zoneSchema.leftPickZones, zoneSchema.rightPickZones, totalRounds, teams);

    return {
        zoneSchema,
        banPickSteps,
        teams,
    };
}
