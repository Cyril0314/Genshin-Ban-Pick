// src/modules/match/domain/IMatchRepository.ts

import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchSnapshot } from './IMatchSnapshot';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

export interface IMatchRepository {
    findAll(): Promise<IMatch[]>;
    findById(matchId: number): Promise<IMatch | undefined>;

    create(snapshot: IMatchSnapshot): Promise<IMatch>;
    preview(snapshot: IMatchSnapshot): Promise<IMatch>;

    delete(matchId: number): Promise<void>;

    findAllMatchTeamMembers(): Promise<TeamMember[]>;
}