// src/modules/room/domain/saveRoomDomain.ts

import { roomService } from '../infrastructure/roomService';

export async function saveRoomDomain(roomId: string) {
    const response = await roomService.postSave(roomId);
    const id = response.data
    return id;
}
