// src/modules/match/infra/MatchSnapshotRepository.ts

import { IMatchSnapshotRepository } from '../domain/IMatchSnapshotRepository.ts';
import { IMatchSnapshot } from '../domain/IMatchSnapshot.ts';
import { IRoomStateManager } from '../../socket/managers/IRoomStateManager.ts';

export class MatchSnapshotRepository implements IMatchSnapshotRepository {
    constructor(private readonly roomStateManager: IRoomStateManager) {}

    getSnapshot(roomId: string): IMatchSnapshot | null {
        const roomState = this.roomStateManager.get(roomId);
        if (!roomState) return null;

        return {
            roomId,
            roomSetting: roomState.roomSetting,
            teamMembersMap: roomState.teamMembersMap,
            boardImageMap: roomState.boardImageMap,
            teamTacticalCellImageMap: roomState.teamTacticalCellImageMap,
            characterRandomContextMap: roomState.characterRandomContextMap,
        };
    }
}
