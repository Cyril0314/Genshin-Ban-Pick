// backend/src/socket/managers/IRoomStateManager.ts

import { IRoomUser } from "../../types/IRoomUser.ts";
import { IChatMessageDTO } from "../../types/IChatMessageDTO.ts";

import { TeamMembersMap } from "../../types/TeamMember.ts";
import type { BoardImageMap, CharacterRandomContextMap, IRoomState, TeamTacticalBoardMap } from "../../types/IRoomState.ts";

export interface IRoomStateManager {
  ensure(roomId: string): IRoomState;
  get(roomId: string): IRoomState | undefined;
  remove(roomId: string): void;

  getUsers(roomId: string): IRoomUser[];
  getChatMessages(roomId: string): IChatMessageDTO[];
  getBoardImageMap(roomId: string): BoardImageMap;
  getCharacterRandomContextMap(roomId: string): CharacterRandomContextMap;
  getTeamMembersMap(roomId: string): TeamMembersMap;
  getStepIndex(roomId: string): number;
  getTeamTacticalBoardMap(roomId: string): TeamTacticalBoardMap;
}