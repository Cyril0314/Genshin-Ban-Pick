// backend/src/socket/managers/RoomStateManager.ts

import { IRoomState, TeamTacticalBoardMap } from '../../types/IRoomState.ts';
import { IRoomStateManager } from './IRoomStateManager.ts';
import { teams } from "../../constants/constants.ts";
import { TeamMembersMap } from '../../types/TeamMember.ts';

const roomStates: Record<string, IRoomState> = {};

export class RoomStateManager implements IRoomStateManager {
    ensure(roomId: string): IRoomState {
        if (!roomStates[roomId]) {
            roomStates[roomId] = {
                users: [],
                chatMessages: [],
                boardImageMap: {},
                characterRandomContextMap: {},
                teamMembersMap: Object.fromEntries(teams.map(t => [t.slot, {}])) as TeamMembersMap,
                teamTacticalBoardMap: Object.fromEntries(teams.map(t => [t.slot, {}])) as TeamTacticalBoardMap,
                stepIndex: 0,
            };
        }
        return roomStates[roomId];
    }

    setRoomState(roomId: string, roomState: IRoomState) {
        roomStates[roomId] = roomState;
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

    getCharacterRandomContextMap(roomId: string) {
        return this.ensure(roomId).characterRandomContextMap;
    }

    getTeamMembersMap(roomId: string) {
        return this.ensure(roomId).teamMembersMap;
    }

    getStepIndex(roomId: string) {
        return this.ensure(roomId).stepIndex;
    }

    getTeamTacticalBoardMap(roomId: string) {
        return this.ensure(roomId).teamTacticalBoardMap;
    }
}