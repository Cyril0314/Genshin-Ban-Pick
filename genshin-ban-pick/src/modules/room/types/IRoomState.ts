// src/modules/room/types/IRoomState.ts

import type { BoardImageMap, ICharacterRandomContext } from "@/modules/board";
import type { IChatMessageDTO } from "@/modules/chat";
import type { TeamMembersMap } from "@/modules/team";
import type { TacticalCellImageMap } from "@/modules/tactical";

import type { IRoomUser } from "./IRoomUser";
import type { IRoomSetting } from "./IRoomSetting";

export type TeamTacticalCellImageMap = Record<number, TacticalCellImageMap>;
export type CharacterRandomContextMap = Record<string, ICharacterRandomContext>;

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessageDTO[];
    boardImageMap: BoardImageMap;
    characterRandomContextMap: CharacterRandomContextMap;
    teamTacticalCellImageMap: TeamTacticalCellImageMap;
    teamMembersMap: TeamMembersMap;
    stepIndex: number;
    roomSetting: IRoomSetting;
}
