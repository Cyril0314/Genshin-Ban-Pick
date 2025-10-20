// backend/src/factories/roomSettingFactory.ts

import { numberOfUtility, numberOfBan, numberOfPick, totalRounds, teams } from "../constants/constants.ts";
import { createZoneSchema } from "../utils/zoneSchema.ts";
import { generateBanPickSteps } from "../utils/banPickSteps.ts";

export function createRoomSetting() {
    const zoneSchema = createZoneSchema(numberOfUtility, numberOfBan, numberOfPick, totalRounds)
    const banPickSteps = generateBanPickSteps(zoneSchema.banZones, zoneSchema.leftPickZones, zoneSchema.rightPickZones, totalRounds, teams);

    return {
        zoneSchema,
        banPickSteps,
        teams,
    };
}