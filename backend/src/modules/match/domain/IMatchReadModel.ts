// src/modules/match/domain/IMatchReadModel.ts

import type { IMatchStatisticsRaw } from '../types/IMatchStatisticsRaw';
import type { IMatchLineupSlotPlacement } from '../types/IMatchLineupSlotPlacement';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';

export interface IMatchReadModel {
    findMatchStatisticsRaw(): Promise<IMatchStatisticsRaw>;

    findMatchLineupSlotPlacements(timeWindow?: ITimeWindow): Promise<IMatchLineupSlotPlacement[]>;

    findMatchLineupSlotsWithCharacter(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotWithCharacter[]>;
}
