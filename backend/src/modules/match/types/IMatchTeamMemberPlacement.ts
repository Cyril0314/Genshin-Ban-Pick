// src/modules/match/types/IMatchTeamMemberPlacement.ts

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

// 一名隊伍成員在某 (match, team) 的出賽列，帶 grain 座標供分組（對稱 IMatchLineupSlotPlacement）。
export interface IMatchTeamMemberPlacement {
    matchId: number;
    teamId: number;
    teamMember: PlayerIdentity;
}
