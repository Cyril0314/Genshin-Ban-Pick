// backend/src/modules/room/infra/RoomStateRepository.ts

import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { IRoomStateManager } from '../../socket/domain/IRoomStateManager';
import type { IRoomStateRepository } from '../domain/IRoomStateRepository';
import type { IRoomState } from '@shared/contracts/room/IRoomState';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';
import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { TeamTacticalCellImageMap } from '@shared/contracts/tactical/TeamTacticalCellImageMap';

export default class RoomStateRepository implements IRoomStateRepository {
    constructor(private roomStateManager: IRoomStateManager) {}

    findAll() {
        return this.roomStateManager.getRoomStates();
    }

    findById(roomId: string) {
        return this.roomStateManager.get(roomId);
    }

    create(roomId: string, state: IRoomState) {
        this.roomStateManager.setRoomState(roomId, state);
        return state;
    }

    upsert(roomId: string, state: IRoomState) {
        this.roomStateManager.setRoomState(roomId, state);
        return state;
    }

    findRoomUsersById(roomId: string): IRoomUser[] | null {
        return this.roomStateManager.getUsers(roomId) ?? null;
    }

    updateRoomUsersById(roomId: string, users: IRoomUser[]) {
        this.roomStateManager.setUsers(roomId, users);
        return users.length;
    }

    findBoardImageMapById(roomId: string): BoardImageMap {
        return this.roomStateManager.getBoardImageMap(roomId) ?? null;
    }

    updateBoardImageMapById(roomId: string, boardImageMap: BoardImageMap): number {
        this.roomStateManager.setBoardImageMap(roomId, boardImageMap);
        return Object.values(boardImageMap).length;
    }

    findCharacterRandomContextMapById(roomId: string): CharacterRandomContextMap | null {
        return this.roomStateManager.getCharacterRandomContextMap(roomId) ?? null;
    }

    updateCharacterRandomContextMapById(roomId: string, characterRandomContextMap: CharacterRandomContextMap): number {
        this.roomStateManager.setCharacterRandomContextMap(roomId, characterRandomContextMap);
        return Object.values(characterRandomContextMap).length;
    }

    findStepIndexById(roomId: string): number | null {
        return this.roomStateManager.getStepIndex(roomId) ?? null;
    }

    updateStepIndexById(roomId: string, stepIndex: number): number {
        this.roomStateManager.setStepIndex(roomId, stepIndex);
        return 1;
    }

    findChatMessagesById(roomId: string): IChatMessage[] | null {
        return this.roomStateManager.getChatMessages(roomId) ?? null;
    }

    updateChatMessagesById(roomId: string, chatMessages: IChatMessage[]): number {
        this.roomStateManager.setChatMessages(roomId, chatMessages);
        return chatMessages.length;
    }

    findTeamMembersMapById(roomId: string): TeamMembersMap | null {
        return this.roomStateManager.getTeamMembersMap(roomId) ?? null;
    }

    updateTeamMembersMapById(roomId: string, teamMembersMap: TeamMembersMap): number {
        this.roomStateManager.setTeamMembersMap(roomId, teamMembersMap);
        return Object.values(teamMembersMap).length;
    }

    findTeamTacticalCellImageMapById(roomId: string): TeamTacticalCellImageMap | null {
        return this.roomStateManager.getTeamTacticalCellImageMap(roomId);
    }

    updateTeamTacticalCellImageMapById(roomId: string, teamTacticalCellImageMap: TeamTacticalCellImageMap): number {
        this.roomStateManager.setTeamTacticalCellImageMap(roomId, teamTacticalCellImageMap);
        return Object.values(teamTacticalCellImageMap).length;
    }
}
