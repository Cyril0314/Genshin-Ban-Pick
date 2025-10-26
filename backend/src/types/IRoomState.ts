// backend/src/type/IRoomState.ts

import { IChatMessage } from "./IChatMessage.ts";
import { IRoomUser } from "./IRoomUser.ts";

export type BoardImageMap = Record<number, string>;
export type TeamMembersMap = Record<number, string>

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessage[];
    boardImageMap: BoardImageMap;
    teamMembersMap: TeamMembersMap;
    stepIndex: number;
}