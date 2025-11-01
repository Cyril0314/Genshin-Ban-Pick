// backend/src/type/IRoomState.ts

import { IChatMessageDTO } from './IChatMessageDTO.ts';
import { IRoomUser } from './IRoomUser.ts';

export type BoardImageMap = Record<number, string>;
export type TeamMember = { type: 'online'; user: IRoomUser } | { type: 'manual'; name: string };
export type TeamMembersMap = Record<number, TeamMember[]>;

export type TacticalCellImageMap = Record<string, string>;
export type TeamTaticalBoardMap = Record<number, TacticalCellImageMap>;

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessageDTO[];
    boardImageMap: BoardImageMap;
    teamTaticalBoardMap: TeamTaticalBoardMap;
    teamMembersMap: TeamMembersMap;
    stepIndex: number;
}
