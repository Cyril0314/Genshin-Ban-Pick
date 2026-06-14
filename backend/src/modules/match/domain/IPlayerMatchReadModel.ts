// src/modules/match/domain/IPlayerMatchReadModel.ts

import type { IPlayerMatchPlacement } from '../types/IPlayerMatchPlacement';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export interface IPlayerMatchReadModel {
    findPlayerMatchPlacements(playerIdentity: PlayerIdentity): Promise<IPlayerMatchPlacement[]>;
}
