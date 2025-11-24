// backend/src/services/room/RoomService.ts

import { PrismaClient } from '@prisma/client/extension';
import { createRoomSetting } from '../../factories/roomSettingFactory.ts';
import { IRoomStateManager } from '../../socket/managers/IRoomStateManager.ts';
import { IRoomSetting } from '../../types/IRoomSetting.ts';
import { TeamTacticalCellImageMap } from '../../types/IRoomState.ts';
import { ITeam } from '../../types/ITeam.ts';
import { TeamMembersMap } from '../../types/TeamMember.ts';

export default class RoomService {
    constructor(
        private prisma: PrismaClient,
        private roomStateManager: IRoomStateManager,
    ) {}

    fetchRooms() {
        const roomStates = this.roomStateManager.getRoomStates();
        return roomStates;
    }

    buildRoom(
        roomId: string,
        payload: {
            numberOfUtility?: number;
            numberOfBan?: number;
            numberOfPick?: number;
            totalRounds?: number;
            teams?: ITeam[];
            numberOfTeamSetup?: number;
            numberOfSetupCharacter?: number;
        },
    ): IRoomSetting {
        const existing = this.roomStateManager.get(roomId);
        if (existing) {
            return existing.roomSetting;
        }
        const roomSetting = createRoomSetting(payload);
        const roomState = {
            users: [],
            chatMessages: [],
            boardImageMap: {},
            characterRandomContextMap: {},
            teamMembersMap: Object.fromEntries(roomSetting.teams.map((t) => [t.slot, {}])) as TeamMembersMap,
            teamTacticalCellImageMap: Object.fromEntries(roomSetting.teams.map((t) => [t.slot, {}])) as TeamTacticalCellImageMap,
            stepIndex: 0,
            roomSetting: roomSetting,
        };
        this.roomStateManager.setRoomState(roomId, roomState);
        return roomSetting;
    }

    getRoomSetting(roomId: string): IRoomSetting {
        const roomState = this.roomStateManager.ensure(roomId);
        return roomState.roomSetting;
    }
}
