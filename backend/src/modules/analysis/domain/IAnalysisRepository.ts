// src/modules/analysis/domain/IAnalysisRepository.ts

import type { IMatchStatisticsOverview } from '../types/IMatchStatisticsOverview';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchLineupSlotCooccurrenceRow } from '../types/IMatchLineupSlotCooccurrenceRow';
import type { IMatchLineupSlotWithTeamMember } from '../types/IMatchLineupSlotWithTeamMember';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter'
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';

export interface IAnalysisRepository {
    findMatchStatisticsOverview(): Promise<IMatchStatisticsOverview>;

    findMatchMinimalTimestamps(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTimeMinimal[]>;

    findMatchLineupSlotsWithTeamMember(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotWithTeamMember[]>;

    findMatchMoveCoreForWeightCalc(timeWindow?: IAnalysisTimeWindow): Promise<IMatchMoveWeightCalcCore[]>;

    findMatchLineupSlotsForCooccurrence(timeWindow?: IAnalysisTimeWindow): Promise<IMatchLineupSlotCooccurrenceRow[]>;

    findMatchLineupSlotsWithCharacter(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotWithCharacter[]>;
}
