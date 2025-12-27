// src/modules/analysis/domain/IAnalysisRepository.ts

import type { IMatchStatisticsOverview } from '../types/IMatchStatisticsOverview';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchTacticalUsageExpandedRefs } from '../types/IMatchTacticalUsageExpandedRefs';
import type { IMatchTacticalUsageTeamMemberIdentityRefs } from '../types/IMatchTacticalUsageUserPreferenceCore';
import type { IMatchTacticalUsageWithCharacter } from '../types/IMatchTacticalUsageWithCharacter'
import type { MatchTeamMemberUniqueIdentityKey } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';

export interface IAnalysisRepository {
    findMatchStatisticsOverview(): Promise<IMatchStatisticsOverview>;

    findAllMatchMinimalTimestamps(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTimeMinimal[]>;

    findAllMatchTacticalUsageIdentities(): Promise<IMatchTacticalUsageTeamMemberIdentityRefs[]>;

    findAllMatchMoveCoreForWeightCalc(timeWindow?: IAnalysisTimeWindow): Promise<IMatchMoveWeightCalcCore[]>;

    findAllMatchTacticalUsageForAnalysis(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTacticalUsageExpandedRefs[]>;

    findAllMatchTacticalUsageWithCharacter(): Promise<IMatchTacticalUsageWithCharacter[]>;

    findMatchTacticalUsageWithCharacterByIdentityKey(identityKey: MatchTeamMemberUniqueIdentityKey): Promise<IMatchTacticalUsageWithCharacter[]>;
}
