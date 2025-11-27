// src/modules/match/domain/IMatchRepository.ts

import { IMatch } from '@shared/contracts/match/IMatch';
import { IMatchSnapshot } from './IMatchSnapshot';

export default interface IMatchRepository {
    create(snapshot: IMatchSnapshot, dryRun?: boolean): Promise<IMatch>;
}