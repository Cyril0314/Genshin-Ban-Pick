// src/types/IRoomSetting.ts

import type { IBanPickStep } from "./IBanPickStep"
import type { ITeam } from "./ITeam"
import type { IZone } from "./IZone"

export interface IRoomSetting {
    zoneSchema: {
        zoneMetaTable: Record<number, IZone>,
        utilityZones: IZone[],
        maxNumberOfUtilityPerColumn: number,
        banZones: IZone[],
        maxNumberOfBanPerRow: number,
        leftPickZones: IZone[],
        rightPickZones: IZone[]
        maxNumberOfPickPerColumn: number,
    },
    banPickSteps: IBanPickStep[],
    teams: ITeam[]
}