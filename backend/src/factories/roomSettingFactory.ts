// backend/src/factories/roomSettingFactory.ts

import { createZoneMetaTable } from '../utils/zoneMetaTable.ts';
import { generateMatchFlow } from '../utils/matchFlow.ts';
import { IRoomSetting } from '../types/IRoomSetting.ts';
import { createAetherTeam, createLumineTeam, ITeam } from '../types/ITeam.ts';

const defaultFlowVersion = 1;
const defaultTotalRounds = 2;
const defaultNumberOfUtility = 3;
const defaultNumberOfBan = 4;
const defaultNumberOfPick = 32;

const defaultTeams: ITeam[] = [createAetherTeam(), createLumineTeam()];
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
    const matchFlow = generateMatchFlow(defaultFlowVersion, zoneMetaTable, totalRounds ?? defaultTotalRounds, teams ?? defaultTeams);

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
