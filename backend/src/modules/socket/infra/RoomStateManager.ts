// backend/src/modules/socket/infra/RoomStateManager.ts

import { createLogger } from '../../../utils/logger';

import type { IRoomStateManager } from '../domain/IRoomStateManager';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { IRoomState } from '@shared/contracts/room/IRoomState';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';
import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';
import type { TeamTacticalCellImageMap } from '@shared/contracts/tactical/TeamTacticalCellImageMap';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

const logger = createLogger('ROOM STATE MANAGER');

export default class RoomStateManager implements IRoomStateManager {
    roomStates: Record<string, IRoomState> = {};
    getRoomStates() {
        return this.roomStates;
    }

    setRoomState(roomId: string, roomState: IRoomState) {
        this.roomStates[roomId] = roomState;
    }

    get(roomId: string) {
        return this.roomStates[roomId];
    }

    remove(roomId: string) {
        delete this.roomStates[roomId];
    }

    getUsers(roomId: string) {
        return this.get(roomId).users;
    }

    setUsers(roomId: string, users: IRoomUser[]) {
        this.roomStates[roomId].users = users;
    }

    getChatMessages(roomId: string) {
        return this.get(roomId).chatMessages;
    }

    setChatMessages(roomId: string, chatMessages: IChatMessage[]): void {
        this.roomStates[roomId].chatMessages = chatMessages;
    }

    getBoardImageMap(roomId: string) {
        return this.get(roomId).boardImageMap;
    }

    setBoardImageMap(roomId: string, boardImageMap: BoardImageMap) {
        this.roomStates[roomId].boardImageMap = boardImageMap;
    }

    getCharacterRandomContextMap(roomId: string) {
        return this.get(roomId).characterRandomContextMap;
    }

    setCharacterRandomContextMap(roomId: string, characterRandomContextMap: CharacterRandomContextMap) {
        this.roomStates[roomId].characterRandomContextMap = characterRandomContextMap;
    }

    getTeamMembersMap(roomId: string) {
        return this.get(roomId).teamMembersMap;
    }

    setTeamMembersMap(roomId: string, teamMembersMap: TeamMembersMap): void {
        this.roomStates[roomId].teamMembersMap = teamMembersMap;
    }

    getStepIndex(roomId: string) {
        return this.get(roomId).stepIndex;
    }

    setStepIndex(roomId: string, stepIndex: number): void {
        this.roomStates[roomId].stepIndex = stepIndex;
    }

    getTeamTacticalCellImageMap(roomId: string) {
        return this.get(roomId).teamTacticalCellImageMap;
    }

    setTeamTacticalCellImageMap(roomId: string, teamTacticalCellImageMap: TeamTacticalCellImageMap): void {
        this.roomStates[roomId].teamTacticalCellImageMap = teamTacticalCellImageMap;
    }
}
