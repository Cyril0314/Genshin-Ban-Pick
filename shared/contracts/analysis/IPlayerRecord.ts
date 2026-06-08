import type { TeamMember } from '../team/TeamMember';
import type { ICharacterSynergy } from './ICharacterSynergy';

export interface IPlayerCharacterFrequency {
    characterKey: string;
    count: number;            // 該玩家用此角色登場 setup 數
    rate: number;             // 0 ~ 1，count / totalSetups
    topSynergies: ICharacterSynergy[];   // 該角色全域共現 Top N
}

export interface IPlayerRecord {
    teamMember: TeamMember;
    totalSetups: number;
    characterFrequency: IPlayerCharacterFrequency[];   // Top N, sorted desc by count
}
