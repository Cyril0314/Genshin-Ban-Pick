// src/modules/analysis/domain/IAnalysisRepository.ts

import type { IMatchStatisticsOverview } from '../types/IMatchStatisticsOverview';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchLineupSlotExpandedRefs } from '../types/IMatchLineupSlotExpandedRefs';
import type { IMatchLineupSlotTeamMemberIdentityRefs } from '../types/IMatchLineupSlotUserPreferenceCore';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter'
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';

export interface IAnalysisRepository {
    findMatchStatisticsOverview(): Promise<IMatchStatisticsOverview>;

    findMatchMinimalTimestamps(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTimeMinimal[]>;

    findAllMatchLineupSlotIdentities(): Promise<IMatchLineupSlotTeamMemberIdentityRefs[]>;

    findMatchMoveCoreForWeightCalc(timeWindow?: IAnalysisTimeWindow): Promise<IMatchMoveWeightCalcCore[]>;

    findMatchLineupSlotsForAnalysis(timeWindow?: IAnalysisTimeWindow): Promise<IMatchLineupSlotExpandedRefs[]>;

    findMatchLineupSlotsWithCharacter(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotWithCharacter[]>;
}
