// backend/src/socket/managers/IRoomStateManager.ts

import { IChatMessageDTO } from "../../../types/IChatMessageDTO.ts";

import { TeamMembersMap } from "../../../types/TeamMember.ts";
import { IRoomState, BoardImageMap, CharacterRandomContextMap, TeamTacticalCellImageMap, IRoomUser } from "../../room/index.ts";

export interface IRoomStateManager {
  getRoomStates(): Record<string, IRoomState>;
  setRoomState(roomId: string, roomState: IRoomState): void;
  get(roomId: string): IRoomState | undefined;
  remove(roomId: string): void;

  getUsers(roomId: string): IRoomUser[];
  setUsers(roomId: string, users: IRoomUser[]): void;
  getChatMessages(roomId: string): IChatMessageDTO[];
  getBoardImageMap(roomId: string): BoardImageMap;
  getCharacterRandomContextMap(roomId: string): CharacterRandomContextMap;
  getTeamMembersMap(roomId: string): TeamMembersMap;
  getStepIndex(roomId: string): number;
  getTeamTacticalCellImageMap(roomId: string): TeamTacticalCellImageMap;
}