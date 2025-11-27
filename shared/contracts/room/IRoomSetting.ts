import type { IMatchFlow } from "../match/IMatchFlow";
import type { IZone } from "../board/IZone";
import type { ITeam } from "../team/ITeam";

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
