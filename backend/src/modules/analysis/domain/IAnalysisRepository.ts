// src/modules/analysis/domain/IAnalysisRepository.ts

import type { IMatchTimeMinimal } from '../types/IMatchTimeMinimal';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchTacticalUsageExpandedRefs } from '../types/IMatchTacticalUsageExpandedRefs';
import type { IMatchTacticalUsageTeamMemberIdentityRefs } from '../types/IMatchTacticalUsageUserPreferenceCore';

export interface IAnalysisRepository {
    findAllMatchMinimalTimestamps(): Promise<IMatchTimeMinimal[]>;

    findAllMatchTacticalUsageIdentities(): Promise<IMatchTacticalUsageTeamMemberIdentityRefs[]>;

    findAllMatchMoveCoreForWeightCalc(): Promise<IMatchMoveWeightCalcCore[]>;

    findAllMatchTacticalUsageForAnalysis(): Promise<IMatchTacticalUsageExpandedRefs[]>;
}