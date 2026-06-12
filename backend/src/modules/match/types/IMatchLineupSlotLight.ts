// src/modules/match/types/IMatchLineupSlotLight.ts

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

// lineup slot 的輕量讀取（Light scope）：只解析出擁有者身分 + 角色，不 join character/nickname
export interface IMatchLineupSlotLight {
    teamMember: PlayerIdentity;
    characterKey: string;
}
