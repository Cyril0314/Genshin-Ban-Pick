// src/types/IBanPickStep.ts

import type { ITeam } from "./ITeam.ts";

export interface IBanPickStep {
    team: ITeam;
    zoneId: string;
    action: 'ban' | 'pick';
}
