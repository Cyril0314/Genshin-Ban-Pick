// src/modules/room/domain/fetchRoomsDomain.ts

import { roomService } from '../infrastructure/roomService';

export async function fetchRoomsDomain() {
    const response = await roomService.get();
    const rooms = response.data;
    return rooms;
}