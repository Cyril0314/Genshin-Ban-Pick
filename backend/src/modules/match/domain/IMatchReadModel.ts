// src/modules/match/domain/IMatchReadModel.ts

import type { IMatchLineupSlotPlacement } from '../types/IMatchLineupSlotPlacement';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter';
import type { IMatchStatistics } from '../types/IMatchStatistics';
import type { IMatchTeamMemberPlacement } from '../types/IMatchTeamMemberPlacement';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export interface IMatchReadModel {
    findMatchStatistics(): Promise<IMatchStatistics>;

    findMatchLineupSlotPlacements(timeWindow?: ITimeWindow): Promise<IMatchLineupSlotPlacement[]>;

    findMatchTeamMemberPlacements(): Promise<IMatchTeamMemberPlacement[]>;

    findMatchLineupSlotsWithCharacter(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotWithCharacter[]>;
}
