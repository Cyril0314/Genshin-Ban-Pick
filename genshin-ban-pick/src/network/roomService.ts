// src/network/roomService.ts
import type { IRoomSetting } from '@/types/IRoomSetting'

export async function fetchRoomSetting(): Promise<IRoomSetting> {
    const response = await fetch('/api/room-setting')
    const roomSetting = await response.json()
    return roomSetting
}