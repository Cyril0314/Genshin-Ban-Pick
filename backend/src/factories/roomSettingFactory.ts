// backend/src/factories/roomSettingFactory.ts

import {
    flowVersion,
    numberOfUtility,
    numberOfBan,
    numberOfPick,
    totalRounds,
    teams,
    tacticalVersion,
    numberOfTeamSetup,
    numberOfSetupCharacter,
} from '../constants/constants.ts';
import { createZoneMetaTable } from '../utils/zoneMetaTable.ts';
import { generateMatchFlow } from '../utils/matchFlow.ts';
import { IRoomSetting } from '../types/IRoomSetting.ts';

export function createRoomSetting(): IRoomSetting {
    const zoneMetaTable = createZoneMetaTable({
        numberOfUtility,
        numberOfBan,
        numberOfPick,
    });
    const matchFlow = generateMatchFlow(flowVersion, zoneMetaTable, totalRounds, teams);

    return {
        zoneMetaTable,
        totalRounds,
        matchFlow,
        teams,
        tacticalVersion,
        numberOfTeamSetup,
        numberOfSetupCharacter,
    };
}
