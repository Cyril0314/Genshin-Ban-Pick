// src/modules/match/domain/IPlayerMatchReadModel.ts

import type { IPlayerMatchLineupSlot } from '../types/IPlayerMatchLineupSlot';
import type { IPlayerMatchPlacement } from '../types/IPlayerMatchPlacement';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export interface IPlayerMatchReadModel {
    findPlayerMatchLineupSlots(playerIdentity: PlayerIdentity): Promise<IPlayerMatchLineupSlot[]>;

    findPlayerMatchPlacements(playerIdentity: PlayerIdentity): Promise<IPlayerMatchPlacement[]>;
}
