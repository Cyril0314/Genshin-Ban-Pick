// src/types/IRoomSetting.ts

import type { IBanPickStep } from "./IBanPickStep"
import type { ITeam } from "./ITeam"

export interface IRoomSetting {
    numberOfBan: number
    numberOfPick: number
    numberOfUtility: number
    totalRounds: number
    teams: ITeam[]
    banPickSteps: IBanPickStep[],
}