// backend/src/socket/managers/IRoomStateManager.ts

import { IRoomUser } from "../../types/IRoomUser.ts";
import { IChatMessageDTO } from "../../types/IChatMessageDTO.ts";

import type { BoardImageMap, IRoomState, TeamMembersMap, TeamTaticalBoardMap } from "../../types/IRoomState.ts";

export interface IRoomStateManager {
  ensure(roomId: string): IRoomState;
  get(roomId: string): IRoomState | undefined;
  remove(roomId: string): void;

  getUsers(roomId: string): IRoomUser[];
  getChatMessages(roomId: string): IChatMessageDTO[];
  getBoardImageMap(roomId: string): BoardImageMap;
  getTeamMembersMap(roomId: string): TeamMembersMap;
  getStepIndex(roomId: string): number;
  getTeamTaticalBoardMap(roomId: string): TeamTaticalBoardMap;
}