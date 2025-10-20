// backend/src/type/IRoomState.ts

import { IChatMessage } from "./IChatMessage.ts";
import { IRoomUser } from "./IRoomUser.ts";
import { IZoneImageEntry } from "./IZone.ts";

export type BoardImageMap = Record<string, IZoneImageEntry>;
export type TeamMembersMap = Record<number, string>

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessage[];
    boardImageMap: BoardImageMap;
    teamMembersMap: TeamMembersMap;
    stepIndex: number;
}