// src/modules/match/domain/IMatchRepository.ts

import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchSnapshot } from './IMatchSnapshot';

export interface IMatchRepository {
    create(snapshot: IMatchSnapshot, dryRun?: boolean): Promise<IMatch>;
}