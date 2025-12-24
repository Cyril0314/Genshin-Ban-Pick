// backend/src/modules/socket/domain/IRoomStateManager.ts

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { IRoomState } from '@shared/contracts/room/IRoomState';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { TeamTacticalCellImageMap } from '@shared/contracts/tactical/TeamTacticalCellImageMap';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';

export interface IRoomStateManager {
  getRoomStates(): Record<string, IRoomState>;
  setRoomState(roomId: string, roomState: IRoomState): void;
  get(roomId: string): IRoomState | undefined;
  remove(roomId: string): void;

  getUsers(roomId: string): IRoomUser[] | undefined;
  setUsers(roomId: string, users: IRoomUser[]): void;
  getChatMessages(roomId: string): IChatMessage[] | undefined;
  setChatMessages(roomId: string, chatMessages: IChatMessage[]): void;
  getBoardImageMap(roomId: string): BoardImageMap | undefined;
  setBoardImageMap(roomId: string, boardImageMap: BoardImageMap): void;
  getCharacterRandomContextMap(roomId: string): CharacterRandomContextMap | undefined;
  setCharacterRandomContextMap(roomId: string, characterRandomContextMap: CharacterRandomContextMap): void;
  getTeamMembersMap(roomId: string): TeamMembersMap | undefined;
  setTeamMembersMap(roomId: string, teamMembersMap: TeamMembersMap): void
  getTeamTacticalCellImageMap(roomId: string): TeamTacticalCellImageMap | undefined;
  setTeamTacticalCellImageMap(roomId: string, teamTacticalCellImageMap: TeamTacticalCellImageMap): void;
}