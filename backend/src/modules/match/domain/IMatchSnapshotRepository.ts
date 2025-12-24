// src/modules/match/domain/IMatchSnapshotRepository.ts

import type { IMatchSnapshot } from './IMatchSnapshot';

export interface IMatchSnapshotRepository {
    findById(roomId: string): IMatchSnapshot | undefined;
}