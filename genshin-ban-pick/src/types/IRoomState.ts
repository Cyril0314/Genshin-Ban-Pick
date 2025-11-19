// src/types/IRoomState.ts

import type { ICharacterRandomContext } from "@/features/BanPick/types/ICharacterRandomContext";
import type { IChatMessageDTO } from "@/features/ChatRoom/types/IChatMessageDTO";
import type { TeamMembersMap } from "./TeamMember";
import type { IRoomUser } from "./IRoomUser";
import type { IRoomSetting } from "./IRoomSetting";

export type BoardImageMap = Record<number, string>;
export type TacticalCellImageMap = Record<number, string>;
export type TeamTacticalBoardMap = Record<number, TacticalCellImageMap>;
export type CharacterRandomContextMap = Record<string, ICharacterRandomContext>;

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessageDTO[];
    boardImageMap: BoardImageMap;
    characterRandomContextMap: CharacterRandomContextMap;
    teamTacticalBoardMap: TeamTacticalBoardMap;
    teamMembersMap: TeamMembersMap;
    stepIndex: number;
    roomSetting: IRoomSetting;
}
