import type { TeamMember } from '../team/TeamMember';

export interface IPlayerCharacterFrequency {
    characterKey: string;
    count: number;            // 該玩家用此角色登場 setup 數
    rate: number;             // 0 ~ 1，count / totalSetups
}

export interface IPlayerRecord {
    teamMember: TeamMember;
    totalSetups: number;
    characterFrequency: IPlayerCharacterFrequency[];   // Top N, sorted desc by count
}
