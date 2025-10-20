// src/types/IBanPickStep.ts

import type { ITeam } from "./ITeam.ts";
import type { IZone } from "./IZone.ts";

export interface IBanPickStep {
    team: ITeam;
    zone: IZone;
}
