// backend/src/modules/socket/managers/RoomStateManager.ts

import { IRoomStateManager } from './IRoomStateManager.ts';
import { IRoomState, IRoomUser } from "../../room/index.ts";
import { createLogger } from '../../../utils/logger.ts';

const logger = createLogger('ROOM STATE MANAGER');

export class RoomStateManager implements IRoomStateManager {
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

    setUsers(roomId: string, users: IRoomUser[]){
        this.roomStates[roomId].users = users;
    }

    getChatMessages(roomId: string) {
        return this.get(roomId).chatMessages;
    }

    getBoardImageMap(roomId: string) {
        return this.get(roomId).boardImageMap;
    }

    getCharacterRandomContextMap(roomId: string) {
        return this.get(roomId).characterRandomContextMap;
    }

    getTeamMembersMap(roomId: string) {
        return this.get(roomId).teamMembersMap;
    }

    getStepIndex(roomId: string) {
        return this.get(roomId).stepIndex;
    }

    getTeamTacticalCellImageMap(roomId: string) {
        return this.get(roomId).teamTacticalCellImageMap;
    }
}
