// shared/contracts/analysis/IPlayerRecord.ts

import type { PlayerIdentity } from '../player/PlayerIdentity';

export interface ICharacterSynergy {
    characterKey: string;     // 與本角色共現的搭檔
    count: number;            // 該 partner 在全域 setup 中共現次數
}

export interface IPlayerCharacterFrequency {
    characterKey: string;
    count: number;            // 該玩家用此角色登場 setup 數
    rate: number;             // 0 ~ 1，count / totalSetups
    topSynergies: ICharacterSynergy[];   // 該角色全域共現 Top N
}

export interface IPlayerRecord {
    identity: PlayerIdentity;
    displayName: string;
    totalSetups: number;
    characterFrequency: IPlayerCharacterFrequency[];   // Top N, sorted desc by count
}
