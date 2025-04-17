// src/types/RoomSetting.ts

export interface RoomSetting {
    numberOfBan: number
    numberOfPick: number
    numberOfUtility: number
    totalRounds: number
    banPickFlow: BanPickStep[]
}

export interface BanPickStep {
    zoneId: string
    action: 'ban' | 'pick'
    player: string
}
