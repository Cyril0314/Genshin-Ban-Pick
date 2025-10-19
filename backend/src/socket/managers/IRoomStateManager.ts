// backend/src/socket/managers/IRoomStateManager.ts

import { IChatMessage } from "../../types/IChatMessage.ts";
import { IRoomUser } from "../../types/IRoomUser.ts";

import type { BoardImageMap, IRoomState, TeamMembersMap } from "../../types/IRoomState.ts";

export interface IRoomStateManager {
  ensure(roomId: string): IRoomState;
  get(roomId: string): IRoomState | undefined;
  remove(roomId: string): void;

  getUsers(roomId: string): IRoomUser[];
  getChatMessages(roomId: string): IChatMessage[];
  getBoardImageMap(roomId: string): BoardImageMap;
  getTeamMembersMap(roomId: string): TeamMembersMap;
  getStepIndex(roomId: string): number;
}