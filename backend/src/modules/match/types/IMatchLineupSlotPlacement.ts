// src/modules/match/types/IMatchLineupSlotPlacement.ts

// 一個角色在某 (match, team, setup) 的位置 —— 攤平的 lineup slot。
export interface IMatchLineupSlotPlacement {
    matchId: number;
    teamId: number;
    setupNumber: number;
    characterKey: string;
}
