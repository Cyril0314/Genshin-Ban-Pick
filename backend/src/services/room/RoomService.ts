// backend/src/services/room/RoomService.ts

import { createRoomSetting } from "../../factories/roomSettingFactory.ts";
import { IRoomSetting } from "../../types/IRoomSetting.ts";
import { RoomStatePersistenceService } from "./RoomStatePersistenceService.ts";

export default class RoomService {
    constructor(private persistenceService: RoomStatePersistenceService) {}

    getSetting(): IRoomSetting {
        return createRoomSetting();
    }

    async save(payload: { roomId: string, roomSetting: IRoomSetting }) {
        return await this.persistenceService.save(payload, false)
    }
}