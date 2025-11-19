// src/types/IRoomSetting.ts

import type { IMatchFlow } from './IMatchFlow';
import type { ITeam } from './ITeam';
import type { IZone } from '../features/BanPick/types/IZone';

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
