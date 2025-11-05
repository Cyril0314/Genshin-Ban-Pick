// src/types/IRoomSetting.ts

import type { IMatchFlow } from './IMatchFlow';
import type { ITeam } from './ITeam';
import type { IZone } from './IZone';

export interface IRoomSetting {
    zoneMetaTable: Record<number, IZone>;
    matchFlow: IMatchFlow;
    totalRounds: number;
    teams: ITeam[];
    tacticalVersion: number;
    numberOfTeamSetup: number;
    numberOfSetupCharacter: number;
}
