// backend/src/modules/room/domain/createRoomSetting.ts

import { ITeam } from '../../../types/ITeam.ts';
import { IRoomSetting } from './IRoomSetting.ts';
import { createDefaultTeams } from './createDefaultTeams.ts';
import { createMatchFlow } from './createMatchFlow.ts';
import { createZoneMetaTable } from './createZoneMetaTable.ts';

const defaultFlowVersion = 1;
const defaultTotalRounds = 2;
const defaultNumberOfUtility = 3;
const defaultNumberOfBan = 4;
const defaultNumberOfPick = 32;

const defaultTeams = createDefaultTeams();
const defaultTacticalVersion = 1;
const defaultNumberOfTeamSetup = 4;
const defaultNumberOfSetupCharacter = 4;

export function createRoomSetting({
    numberOfUtility,
    numberOfBan,
    numberOfPick,
    totalRounds,
    teams,
    numberOfTeamSetup,
    numberOfSetupCharacter,
}: {
    numberOfUtility?: number;
    numberOfBan?: number;
    numberOfPick?: number;
    totalRounds?: number;
    teams?: ITeam[];
    numberOfTeamSetup?: number;
    numberOfSetupCharacter?: number;
}): IRoomSetting {
    const zoneMetaTable = createZoneMetaTable({
        numberOfUtility: numberOfUtility ?? defaultNumberOfUtility,
        numberOfBan: numberOfBan ?? defaultNumberOfBan,
        numberOfPick: numberOfPick ?? defaultNumberOfPick,
    });
    const matchFlow = createMatchFlow(defaultFlowVersion, zoneMetaTable, totalRounds ?? defaultTotalRounds, teams ?? defaultTeams);

    return {
        zoneMetaTable,
        matchFlow,

        flowVersion: defaultFlowVersion,
        totalRounds: totalRounds ?? defaultTotalRounds,
        numberOfUtility: numberOfUtility ?? defaultNumberOfUtility,
        numberOfBan: numberOfBan ?? defaultNumberOfBan,
        numberOfPick: numberOfPick ?? defaultNumberOfPick,
        teams: teams ?? defaultTeams,
        tacticalVersion: defaultTacticalVersion,
        numberOfTeamSetup: numberOfTeamSetup ?? defaultNumberOfTeamSetup,
        numberOfSetupCharacter: numberOfSetupCharacter ?? defaultNumberOfSetupCharacter,
    };
}
