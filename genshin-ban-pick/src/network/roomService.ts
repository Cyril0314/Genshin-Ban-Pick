// src/network/roomService.ts
import type { RoomSetting } from '@/types/RoomSetting'

export async function fetchRoomSetting(): Promise<RoomSetting> {
    const response = await fetch('/api/room-setting')
    const roomSetting = await response.json()
    return roomSetting
}