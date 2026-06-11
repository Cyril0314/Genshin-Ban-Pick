// src/modules/match/domain/IMatchReadModel.ts

import type { IMatchStatistics } from '../types/IMatchStatistics';
import type { IMatchLineupSlotPlacement } from '../types/IMatchLineupSlotPlacement';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';

export interface IMatchReadModel {
    findMatchStatistics(): Promise<IMatchStatistics>;

    findMatchLineupSlotPlacements(timeWindow?: ITimeWindow): Promise<IMatchLineupSlotPlacement[]>;

    findMatchLineupSlotsWithCharacter(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotWithCharacter[]>;
}
