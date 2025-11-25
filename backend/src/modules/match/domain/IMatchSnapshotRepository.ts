// src/modules/match/domain/IMatchSnapshotRepository.ts

import { IMatchSnapshot } from './IMatchSnapshot.ts';

export interface IMatchSnapshotRepository {
    getSnapshot(roomId: string): IMatchSnapshot | null;
}