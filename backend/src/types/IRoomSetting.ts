// backend/src/types/IRoomSetting.ts

import type { IMatchFlow } from './IMatchFlow.ts';
import type { ITeam } from './ITeam.ts';
import type { IZone } from './IZone.ts';

export interface IRoomSetting {
    zoneMetaTable: Record<number, IZone>;
    matchFlow: IMatchFlow;
    flowVersion: number;
    totalRounds: number;
    numberOfUtility: number;
    numberOfBan: number;
    numberOfPick: number;
    teams: ITeam[];
    tacticalVersion: number;
    numberOfTeamSetup: number;
    numberOfSetupCharacter: number;
}
