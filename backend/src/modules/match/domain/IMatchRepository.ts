// src/modules/match/domain/IMatchRepository.ts

import { IMatchSnapshot } from './IMatchSnapshot';

export default interface IMatchRepository {
    create(snapshot: IMatchSnapshot, dryRun?: boolean): Promise<any>;
}