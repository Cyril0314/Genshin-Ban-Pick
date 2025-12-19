// src/modules/analysis/domain/IAnalysisRepository.ts

import type { IMatchStatisticsOverview } from '../types/IMatchStatisticsOverview';
import type { IMatchTimeMinimal } from '../types/IMatchTimeMinimal';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchTacticalUsageExpandedRefs } from '../types/IMatchTacticalUsageExpandedRefs';
import type { IMatchTacticalUsageTeamMemberIdentityRefs } from '../types/IMatchTacticalUsageUserPreferenceCore';
import type { IMatchTacticalUsageWithCharacter } from '../types/IMatchTacticalUsageWithCharacter'
import type { MatchTeamMemberUniqueIdentityKey } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export interface IAnalysisRepository {
    findMatchStatisticsOverview(): Promise<IMatchStatisticsOverview>;

    findAllMatchMinimalTimestamps(): Promise<IMatchTimeMinimal[]>;

    findAllMatchTacticalUsageIdentities(): Promise<IMatchTacticalUsageTeamMemberIdentityRefs[]>;

    findAllMatchMoveCoreForWeightCalc(): Promise<IMatchMoveWeightCalcCore[]>;

    findAllMatchTacticalUsageForAnalysis(): Promise<IMatchTacticalUsageExpandedRefs[]>;

    findAllMatchTacticalUsageWithCharacter(): Promise<IMatchTacticalUsageWithCharacter[]>;

    findMatchTacticalUsageWithCharacterByIdentityKey(identityKey: MatchTeamMemberUniqueIdentityKey): Promise<IMatchTacticalUsageWithCharacter[]>;
}
