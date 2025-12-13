// src/modules/room/domain/IRoomStateRepository.ts

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { IRoomState } from '@shared/contracts/room/IRoomState';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';
import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { TeamTacticalCellImageMap } from '@shared/contracts/tactical/TeamTacticalCellImageMap';

export interface IRoomStateRepository {
    findAll(): Record<string, IRoomState>;
    findById(roomId: string): IRoomState | null;
    create(roomId: string, state: IRoomState): IRoomState;
    upsert(roomId: string, state: IRoomState): IRoomState;

    findRoomUsersById(roomId: string): IRoomUser[] | null;
    updateRoomUsersById(roomId: string, users: IRoomUser[]): number;

    findBoardImageMapById(roomId: string): BoardImageMap| null ;
    updateBoardImageMapById(roomId: string, boardImageMap: BoardImageMap): number;

    findCharacterRandomContextMapById(roomId: string): CharacterRandomContextMap | null ;
    updateCharacterRandomContextMapById(roomId: string, characterRandomContextMap: CharacterRandomContextMap): number;

    findChatMessagesById(roomId: string): IChatMessage[] | null;
    updateChatMessagesById(roomId: string, chatMessages: IChatMessage[]): number;

    findTeamMembersMapById(roomId: string): TeamMembersMap | null;
    updateTeamMembersMapById(roomId: string, teamMembersMap: TeamMembersMap): number;

    findTeamTacticalCellImageMapById(roomId: string): TeamTacticalCellImageMap | null;
    updateTeamTacticalCellImageMapById(roomId: string, teamTacticalCellImageMap: TeamTacticalCellImageMap): number;
}
