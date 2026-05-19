// src/modules/analysis/domain/IAnalysisRepository.ts

import type { IMatchStatisticsOverview } from '../types/IMatchStatisticsOverview';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchTacticalUsageExpandedRefs } from '../types/IMatchTacticalUsageExpandedRefs';
import type { IMatchTacticalUsageTeamMemberIdentityRefs } from '../types/IMatchTacticalUsageUserPreferenceCore';
import type { IMatchTacticalUsageWithCharacter } from '../types/IMatchTacticalUsageWithCharacter'
import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';

export interface IAnalysisRepository {
    findMatchStatisticsOverview(): Promise<IMatchStatisticsOverview>;

    findAllMatchMinimalTimestamps(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTimeMinimal[]>;

    findAllMatchTacticalUsageIdentities(): Promise<IMatchTacticalUsageTeamMemberIdentityRefs[]>;

    findAllMatchMoveCoreForWeightCalc(timeWindow?: IAnalysisTimeWindow): Promise<IMatchMoveWeightCalcCore[]>;

    findAllMatchTacticalUsageForAnalysis(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTacticalUsageExpandedRefs[]>;

    findAllMatchTacticalUsageWithCharacter(): Promise<IMatchTacticalUsageWithCharacter[]>;

    findMatchTacticalUsageWithCharacterByPlayerIdentity(playerIdentity: PlayerIdentity): Promise<IMatchTacticalUsageWithCharacter[]>;
}
