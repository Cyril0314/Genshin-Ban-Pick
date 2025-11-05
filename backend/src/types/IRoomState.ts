// backend/src/types/IRoomState.ts

import { IChatMessageDTO } from './IChatMessageDTO.ts';
import { IRoomUser } from './IRoomUser.ts';
import { TeamMembersMap } from './TeamMember.ts';

export type BoardImageMap = Record<number, string>;
export type TacticalCellImageMap = Record<number, string>;
export type TeamTacticalBoardMap = Record<number, TacticalCellImageMap>;

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessageDTO[];
    boardImageMap: BoardImageMap;
    teamTacticalBoardMap: TeamTacticalBoardMap;
    teamMembersMap: TeamMembersMap;
    stepIndex: number;
}
