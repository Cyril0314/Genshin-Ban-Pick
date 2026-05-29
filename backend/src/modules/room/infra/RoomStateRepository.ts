// backend/src/modules/room/infra/RoomStateRepository.ts

import { RoomNotFoundError } from '../../../errors/AppError';

import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { IRoomStateManager } from '../domain/IRoomStateManager';
import type { IRoomStateRepository } from '../domain/IRoomStateRepository';
import type { IRoomState } from '@shared/contracts/room/IRoomState';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';
import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { TeamLineupImageMap } from '@shared/contracts/lineup/TeamLineupImageMap';

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

    findRoomUsersById(roomId: string): IRoomUser[] {
        const result = this.roomStateManager.getUsers(roomId);
        if (result === undefined) throw new RoomNotFoundError();
        return result;
    }

    updateRoomUsersById(roomId: string, users: IRoomUser[]) {
        this.roomStateManager.setUsers(roomId, users);
        return users.length;
    }

    findBoardImageMapById(roomId: string): BoardImageMap {
        const result = this.roomStateManager.getBoardImageMap(roomId);
        if (result === undefined) throw new RoomNotFoundError();
        return result;
    }

    updateBoardImageMapById(roomId: string, boardImageMap: BoardImageMap): number {
        this.roomStateManager.setBoardImageMap(roomId, boardImageMap);
        return Object.values(boardImageMap).length;
    }

    findCharacterRandomContextMapById(roomId: string): CharacterRandomContextMap {
        const result = this.roomStateManager.getCharacterRandomContextMap(roomId);
        if (result === undefined) throw new RoomNotFoundError();
        return result;
    }

    updateCharacterRandomContextMapById(roomId: string, characterRandomContextMap: CharacterRandomContextMap): number {
        this.roomStateManager.setCharacterRandomContextMap(roomId, characterRandomContextMap);
        return Object.values(characterRandomContextMap).length;
    }

    findChatMessagesById(roomId: string): IChatMessage[] {
        const result = this.roomStateManager.getChatMessages(roomId);
        if (result === undefined) throw new RoomNotFoundError();
        return result;
    }

    updateChatMessagesById(roomId: string, chatMessages: IChatMessage[]): number {
        this.roomStateManager.setChatMessages(roomId, chatMessages);
        return chatMessages.length;
    }

    findTeamMembersMapById(roomId: string): TeamMembersMap {
        const result = this.roomStateManager.getTeamMembersMap(roomId);
        if (result === undefined) throw new RoomNotFoundError();
        return result;
    }

    updateTeamMembersMapById(roomId: string, teamMembersMap: TeamMembersMap): number {
        this.roomStateManager.setTeamMembersMap(roomId, teamMembersMap);
        return Object.values(teamMembersMap).length;
    }

    findTeamLineupImageMapById(roomId: string): TeamLineupImageMap {
        const result = this.roomStateManager.getTeamLineupImageMap(roomId);
        if (result === undefined) throw new RoomNotFoundError();
        return result;
    }

    updateTeamLineupImageMapById(roomId: string, teamLineupImageMap: TeamLineupImageMap): number {
        this.roomStateManager.setTeamLineupImageMap(roomId, teamLineupImageMap);
        return Object.values(teamLineupImageMap).length;
    }
}
