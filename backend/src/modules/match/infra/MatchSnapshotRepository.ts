// src/modules/match/infra/MatchSnapshotRepository.ts

import IMatchSnapshotRepository from '../domain/IMatchSnapshotRepository';
import { IMatchSnapshot } from '../domain/IMatchSnapshot';
import IRoomStateManager from '../../socket/domain/IRoomStateManager';

export default class MatchSnapshotRepository implements IMatchSnapshotRepository {
    constructor(private readonly roomStateManager: IRoomStateManager) {}

    findById(roomId: string): IMatchSnapshot | null {
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
