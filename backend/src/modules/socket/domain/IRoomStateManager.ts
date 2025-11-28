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

  getUsers(roomId: string): IRoomUser[];
  setUsers(roomId: string, users: IRoomUser[]): void;
  getChatMessages(roomId: string): IChatMessage[];
  getBoardImageMap(roomId: string): BoardImageMap;
  getCharacterRandomContextMap(roomId: string): CharacterRandomContextMap;
  getTeamMembersMap(roomId: string): TeamMembersMap;
  getStepIndex(roomId: string): number;
  getTeamTacticalCellImageMap(roomId: string): TeamTacticalCellImageMap;
}