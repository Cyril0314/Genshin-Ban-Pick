// backend/src/types/IRoomState.ts

import { ICharacterRandomContext } from './ICharacterRandomContext.ts';
import { IChatMessageDTO } from './IChatMessageDTO.ts';
import { IRoomUser } from './IRoomUser.ts';
import { TeamMembersMap } from './TeamMember.ts';

export type BoardImageMap = Record<number, string>;
export type TacticalCellImageMap = Record<number, string>;
export type TeamTacticalBoardMap = Record<number, TacticalCellImageMap>;
export type CharacterRandomContextMap = Record<string, ICharacterRandomContext>;

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessageDTO[];
    boardImageMap: BoardImageMap;
    characterRandomContextMap: CharacterRandomContextMap;
    teamTacticalBoardMap: TeamTacticalBoardMap;
    teamMembersMap: TeamMembersMap;
    stepIndex: number;
}
