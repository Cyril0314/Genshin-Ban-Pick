// src/types/IRoomSetting.ts

import type { IBanPickStep } from "./IBanPickStep"
import type { ITeam } from "./ITeam"
import type { IZone } from "./IZone"

export interface IRoomSetting {
    zoneSchema: {
        zoneMetaTable: Record<number, IZone>,
        utilityZones: IZone[],
        banZones: IZone[],
        leftPickZones: IZone[],
        rightPickZones: IZone[]
    },
    banPickSteps: IBanPickStep[],
    teams: ITeam[]
}