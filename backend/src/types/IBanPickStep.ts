// backend/src/type/IBanPickStep.ts

import { ITeam } from "./ITeam.ts";

export interface IBanPickStep {
    team: ITeam;
    zoneId: string;
    action: 'ban' | 'pick';
}
