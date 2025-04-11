// src/types/RoomSetting.ts

export interface BanPickStep {
    zoneId: string
    action: 'ban' | 'pick'
    player: string // e.g. 'Team A', 'Team B'
}

export interface RoomSetting {
    numberOfBan: number
    numberOfPick: number
    numberOfUtility: number
    totalRounds: number
    banPickFlow: BanPickStep[]
}