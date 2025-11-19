// backend/src/services/room/RoomService.ts

import { PrismaClient } from '@prisma/client/extension';
import { DataNotFoundError } from '../../errors/AppError.ts';
import { createRoomSetting } from '../../factories/roomSettingFactory.ts';
import { IRoomStateManager } from '../../socket/managers/IRoomStateManager.ts';
import { IRoomSetting } from '../../types/IRoomSetting.ts';
import { TeamTacticalBoardMap } from '../../types/IRoomState.ts';
import { ITeam } from '../../types/ITeam.ts';
import { TeamMembersMap } from '../../types/TeamMember.ts';
import { RoomStatePersistenceService } from './RoomStatePersistenceService.ts';

export default class RoomService {
    private persistenceService: RoomStatePersistenceService;
    constructor(
        private prisma: PrismaClient,
        private roomStateManager: IRoomStateManager,
    ) {
        this.persistenceService = new RoomStatePersistenceService(this.prisma);
    }

    fetchRooms() {
        const roomStates = this.roomStateManager.getRoomStates()
        return roomStates;
    }

    build(
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
            teamTacticalBoardMap: Object.fromEntries(roomSetting.teams.map((t) => [t.slot, {}])) as TeamTacticalBoardMap,
            stepIndex: 0,
            roomSetting: roomSetting,
        };
        this.roomStateManager.setRoomState(roomId, roomState);
        return roomSetting;
    }

    getSetting(roomId: string): IRoomSetting {
        const roomState = this.roomStateManager.ensure(roomId);
        return roomState.roomSetting;
    }

    async save(roomId: string) {
        const existing = this.roomStateManager.get(roomId);
        if (!existing) {
            throw new DataNotFoundError();
        }
        return await this.persistenceService.save(existing, false);
    }
}
