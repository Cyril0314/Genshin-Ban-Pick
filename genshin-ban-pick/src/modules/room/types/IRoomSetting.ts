// src/modules/room/types/IRoomSetting.ts

import type { IMatchFlow } from '@/modules/board/types/IMatchFlow';
import type { ITeam } from '@/types/ITeam';
import type { IZone } from '@/modules/board/types/IZone';

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
