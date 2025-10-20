// backend/src/type/IBanPickStep.ts

import { ITeam } from "./ITeam.ts";
import { IZone } from "./IZone.ts";

export interface IBanPickStep {
    team: ITeam;
    zone: IZone
}
