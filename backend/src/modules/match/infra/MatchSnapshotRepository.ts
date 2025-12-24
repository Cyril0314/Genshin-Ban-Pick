// src/modules/match/infra/MatchSnapshotRepository.ts

import type { IMatchSnapshotRepository } from '../domain/IMatchSnapshotRepository';
import type { IMatchSnapshot } from '../domain/IMatchSnapshot';
import type { IRoomStateManager } from '../../socket/domain/IRoomStateManager';

export default class MatchSnapshotRepository implements IMatchSnapshotRepository {
    constructor(private readonly roomStateManager: IRoomStateManager) {}

    findById(roomId: string): IMatchSnapshot | undefined {
        const roomState = this.roomStateManager.get(roomId);
        if (!roomState) return undefined;

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
