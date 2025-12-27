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

    findRoomUsersById(roomId: string): IRoomUser[] | undefined {
        return this.roomStateManager.getUsers(roomId) ?? undefined;
    }

    updateRoomUsersById(roomId: string, users: IRoomUser[]) {
        this.roomStateManager.setUsers(roomId, users);
        return users.length;
    }

    findBoardImageMapById(roomId: string): BoardImageMap {
        return this.roomStateManager.getBoardImageMap(roomId) ?? undefined;
    }

    updateBoardImageMapById(roomId: string, boardImageMap: BoardImageMap): number {
        this.roomStateManager.setBoardImageMap(roomId, boardImageMap);
        return Object.values(boardImageMap).length;
    }

    findCharacterRandomContextMapById(roomId: string): CharacterRandomContextMap | undefined {
        return this.roomStateManager.getCharacterRandomContextMap(roomId) ?? undefined;
    }

    updateCharacterRandomContextMapById(roomId: string, characterRandomContextMap: CharacterRandomContextMap): number {
        this.roomStateManager.setCharacterRandomContextMap(roomId, characterRandomContextMap);
        return Object.values(characterRandomContextMap).length;
    }

    findChatMessagesById(roomId: string): IChatMessage[] | undefined {
        return this.roomStateManager.getChatMessages(roomId) ?? undefined;
    }

    updateChatMessagesById(roomId: string, chatMessages: IChatMessage[]): number {
        this.roomStateManager.setChatMessages(roomId, chatMessages);
        return chatMessages.length;
    }

    findTeamMembersMapById(roomId: string): TeamMembersMap | undefined {
        return this.roomStateManager.getTeamMembersMap(roomId) ?? undefined;
    }

    updateTeamMembersMapById(roomId: string, teamMembersMap: TeamMembersMap): number {
        this.roomStateManager.setTeamMembersMap(roomId, teamMembersMap);
        return Object.values(teamMembersMap).length;
    }

    findTeamTacticalCellImageMapById(roomId: string): TeamTacticalCellImageMap | undefined {
        return this.roomStateManager.getTeamTacticalCellImageMap(roomId);
    }

    updateTeamTacticalCellImageMapById(roomId: string, teamTacticalCellImageMap: TeamTacticalCellImageMap): number {
        this.roomStateManager.setTeamTacticalCellImageMap(roomId, teamTacticalCellImageMap);
        return Object.values(teamTacticalCellImageMap).length;
    }
}
