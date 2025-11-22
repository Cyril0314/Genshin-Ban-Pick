// backend/src/socket/managers/RoomStateManager.ts

import { createRoomSetting } from '../../factories/roomSettingFactory.ts';
import { IRoomState, TeamTacticalCellImageMap } from '../../types/IRoomState.ts';
import { TeamMembersMap } from '../../types/TeamMember.ts';
import { createLogger } from '../../utils/logger.ts';
import { IRoomStateManager } from './IRoomStateManager.ts';

const logger = createLogger('ROOM STATE MANAGER');

export class RoomStateManager implements IRoomStateManager {
    roomStates: Record<string, IRoomState> = {};
    getRoomStates() {
        return this.roomStates;
    }

    setRoomState(roomId: string, roomState: IRoomState) {
        this.roomStates[roomId] = roomState;
    }

    ensure(roomId: string): IRoomState {
        if (!this.roomStates[roomId]) {
            logger.warn(`roomId doesn't exist`, roomId)
            const defaultPayload = {};
            const defaultRoomSetting = createRoomSetting(defaultPayload);
            this.roomStates[roomId] = {
                users: [],
                chatMessages: [],
                boardImageMap: {},
                characterRandomContextMap: {},
                teamMembersMap: Object.fromEntries(defaultRoomSetting.teams.map((t) => [t.slot, {}])) as TeamMembersMap,
                teamTacticalCellImageMap: Object.fromEntries(defaultRoomSetting.teams.map((t) => [t.slot, {}])) as TeamTacticalCellImageMap,
                stepIndex: 0,
                roomSetting: defaultRoomSetting,
            };
        }
        return this.roomStates[roomId];
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
