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
    findById(roomId: string): IRoomState | undefined;
    create(roomId: string, state: IRoomState): IRoomState;
    upsert(roomId: string, state: IRoomState): IRoomState;

    findRoomUsersById(roomId: string): IRoomUser[] | undefined;
    updateRoomUsersById(roomId: string, users: IRoomUser[]): number;

    findBoardImageMapById(roomId: string): BoardImageMap| undefined ;
    updateBoardImageMapById(roomId: string, boardImageMap: BoardImageMap): number;

    findCharacterRandomContextMapById(roomId: string): CharacterRandomContextMap | undefined ;
    updateCharacterRandomContextMapById(roomId: string, characterRandomContextMap: CharacterRandomContextMap): number;

    findChatMessagesById(roomId: string): IChatMessage[] | undefined;
    updateChatMessagesById(roomId: string, chatMessages: IChatMessage[]): number;

    findTeamMembersMapById(roomId: string): TeamMembersMap | undefined;
    updateTeamMembersMapById(roomId: string, teamMembersMap: TeamMembersMap): number;

    findTeamTacticalCellImageMapById(roomId: string): TeamTacticalCellImageMap | undefined;
    updateTeamTacticalCellImageMapById(roomId: string, teamTacticalCellImageMap: TeamTacticalCellImageMap): number;
}
