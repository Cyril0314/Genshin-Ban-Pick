// backend/src/services/RoomService.ts

import { createRoomSetting } from "../factories/roomSettingFactory.ts";

export default class RoomService {
    getRoomSetting() {
        return createRoomSetting();
    }
}