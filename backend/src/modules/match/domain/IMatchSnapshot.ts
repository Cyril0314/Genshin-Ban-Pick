// src/modules/match/domain/IMatchSnapshot.ts

import { TeamMembersMap } from "../../../types/TeamMember.ts";
import { BoardImageMap, CharacterRandomContextMap, IRoomSetting, TeamTacticalCellImageMap } from "../../room/index.ts";

export interface IMatchSnapshot {
    roomId: string;

    roomSetting: IRoomSetting;

    teamMembersMap: TeamMembersMap;

    boardImageMap: BoardImageMap;

    teamTacticalCellImageMap: TeamTacticalCellImageMap;

    characterRandomContextMap: CharacterRandomContextMap;
}
