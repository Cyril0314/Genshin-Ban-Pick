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
  get(roomId: string): IRoomState | null;
  remove(roomId: string): void;

  getUsers(roomId: string): IRoomUser[] | null;
  setUsers(roomId: string, users: IRoomUser[]): void;
  getChatMessages(roomId: string): IChatMessage[] | null;
  setChatMessages(roomId: string, chatMessages: IChatMessage[]): void;
  getBoardImageMap(roomId: string): BoardImageMap | null;
  setBoardImageMap(roomId: string, boardImageMap: BoardImageMap): void;
  getCharacterRandomContextMap(roomId: string): CharacterRandomContextMap | null;
  setCharacterRandomContextMap(roomId: string, characterRandomContextMap: CharacterRandomContextMap): void;
  getTeamMembersMap(roomId: string): TeamMembersMap | null;
  setTeamMembersMap(roomId: string, teamMembersMap: TeamMembersMap): void
  getStepIndex(roomId: string): number | null;
  setStepIndex(roomId: string, stepIndex: number): void;
  getTeamTacticalCellImageMap(roomId: string): TeamTacticalCellImageMap | null;
  setTeamTacticalCellImageMap(roomId: string, teamTacticalCellImageMap: TeamTacticalCellImageMap): void;
}