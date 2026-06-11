// 某玩家參與過的一場比賽（輕量 summary，點開走既有 match 詳情 modal）
export interface IPlayerMatchSummary {
    matchId: number;
    createdAt: Date;
    characterKeys: string[]; // 該玩家當場用過的角色（去重）
}
