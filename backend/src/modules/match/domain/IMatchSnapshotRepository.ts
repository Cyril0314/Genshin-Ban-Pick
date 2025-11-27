// src/modules/match/domain/IMatchSnapshotRepository.ts

import { IMatchSnapshot } from './IMatchSnapshot';

export default interface IMatchSnapshotRepository {
    findById(roomId: string): IMatchSnapshot | null;
}