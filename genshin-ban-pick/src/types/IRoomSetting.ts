// src/types/IRoomSetting.ts

import type { IBanPickStep } from './IBanPickStep';
import type { ITeam } from './ITeam';
import type { IZone } from './IZone';

export interface IRoomSetting {
    zoneMetaTable: Record<number, IZone>;
    banPickSteps: IBanPickStep[];
    totalRounds: number;
    teams: ITeam[];
    numberOfTeamSetup: number;
    numberOfSetupCharacter: number;
}
