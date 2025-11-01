// backend/src/socket/managers/RoomStateManager.ts

import { IRoomState, TeamMember, TeamMembersMap, TeamTaticalBoardMap } from '../../types/IRoomState.ts';
import { IRoomStateManager } from './IRoomStateManager.ts';
import { teams } from "../../constants/constants.ts";

const roomStates: Record<string, IRoomState> = {};

export class RoomStateManager implements IRoomStateManager {
    ensure(roomId: string): IRoomState {
        if (!roomStates[roomId]) {
            roomStates[roomId] = {
                users: [],
                chatMessages: [],
                boardImageMap: {},
                teamMembersMap: Object.fromEntries(teams.map(t => [t.id, []])) as TeamMembersMap,
                teamTaticalBoardMap: Object.fromEntries(teams.map(t => [t.id, {}])) as TeamTaticalBoardMap,
                stepIndex: 0,
            };
        }
        return roomStates[roomId];
    }

    get(roomId: string) {
        return roomStates[roomId];
    }

    remove(roomId: string) {
        delete roomStates[roomId];
    }

    getUsers(roomId: string) {
        return this.ensure(roomId).users;
    }

    getChatMessages(roomId: string) {
        return this.ensure(roomId).chatMessages;
    }

    getBoardImageMap(roomId: string) {
        return this.ensure(roomId).boardImageMap;
    }

    getTeamMembersMap(roomId: string) {
        return this.ensure(roomId).teamMembersMap;
    }

    getStepIndex(roomId: string) {
        return this.ensure(roomId).stepIndex;
    }

    getTeamTaticalBoardMap(roomId: string) {
        return this.ensure(roomId).teamTaticalBoardMap;
    }
}