// src/modules/match/domain/IMatchRepository.ts

import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchSnapshot } from './IMatchSnapshot';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export interface IMatchRepository {
    create(snapshot: IMatchSnapshot, dryRun?: boolean): Promise<IMatch>;

    findAllMatchTeamMemberUniqueIdentities(): Promise<MatchTeamMemberUniqueIdentity[]>;
}