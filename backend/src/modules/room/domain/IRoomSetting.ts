// backend/src/modules/room/domain/IRoomSetting.ts

import { IMatchFlow } from "../../match/domain/IMatchFlow.ts";
import { ITeam } from "../../../types/ITeam.ts";
import { IZone } from "../../../types/IZone.ts";

export interface IRoomSetting {
    zoneMetaTable: Record<number, IZone>;
    matchFlow: IMatchFlow;
    flowVersion: number;
    totalRounds: number;
    numberOfUtility: number;
    numberOfBan: number;
    numberOfPick: number;
    teams: ITeam[];
    tacticalVersion: number;
    numberOfTeamSetup: number;
    numberOfSetupCharacter: number;
}
