// src/modules/match/domain/IMatchRepository.ts

import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchSnapshot } from './IMatchSnapshot';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export interface IMatchRepository {
    findAllMatches(): Promise<IMatch[]>;

    create(snapshot: IMatchSnapshot, dryRun?: boolean): Promise<IMatch>;

    delete(matchId: number): Promise<void>;

    findAllMatchTeamMemberUniqueIdentities(): Promise<MatchTeamMemberUniqueIdentity[]>;
}