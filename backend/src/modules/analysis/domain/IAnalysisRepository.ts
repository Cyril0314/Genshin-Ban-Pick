// src/modules/analysis/domain/IAnalysisRepository.ts

import type { IMatchTimeMinimal } from '../types/IMatchTimeMinimal';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchTacticalUsageExpandedRefs } from '../types/IMatchTacticalUsageExpandedRefs';
import type { IMatchTacticalUsageTeamMemberIdentityRefs } from '../types/IMatchTacticalUsageUserPreferenceCore';
import type { IMatchTacticalUsageWithCharacter } from '../types/IMatchTacticalUsageWithCharacter'
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export interface IAnalysisRepository {
    findAllMatchMinimalTimestamps(): Promise<IMatchTimeMinimal[]>;

    findAllMatchTacticalUsageIdentities(): Promise<IMatchTacticalUsageTeamMemberIdentityRefs[]>;

    findAllMatchMoveCoreForWeightCalc(): Promise<IMatchMoveWeightCalcCore[]>;

    findAllMatchTacticalUsageForAnalysis(): Promise<IMatchTacticalUsageExpandedRefs[]>;

    findAllMatchTacticalUsageWithCharacter(): Promise<IMatchTacticalUsageWithCharacter[]>;

    findMatchTacticalUsageWithCharacterByIdentity(identity: MatchTeamMemberUniqueIdentity): Promise<IMatchTacticalUsageWithCharacter[]>;
}
