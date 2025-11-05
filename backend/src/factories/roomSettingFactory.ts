// backend/src/factories/roomSettingFactory.ts

import {
    numberOfUtility,
    numberOfBan,
    numberOfPick,
    totalRounds,
    teams,
    numberOfTeamSetup,
    numberOfSetupCharacter,
} from '../constants/constants.ts';
import { createZoneMetaTable } from '../utils/zoneMetaTable.ts';
import { generateBanPickSteps } from '../utils/banPickSteps.ts';

export function createRoomSetting() {
    const zoneMetaTable = createZoneMetaTable({
        numberOfUtility,
        numberOfBan,
        numberOfPick,
    });
    const banPickSteps = generateBanPickSteps(zoneMetaTable, totalRounds, teams);

    return {
        zoneMetaTable,
        totalRounds,
        banPickSteps,
        teams,
        numberOfTeamSetup,
        numberOfSetupCharacter,
    };
}
