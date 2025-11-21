// backend/src/types/IRoomState.ts

import { ICharacterRandomContext } from './ICharacterRandomContext.ts';
import { IChatMessageDTO } from './IChatMessageDTO.ts';
import { IRoomSetting } from './IRoomSetting.ts';
import { IRoomUser } from './IRoomUser.ts';
import { TeamMembersMap } from './TeamMember.ts';

export type BoardImageMap = Record<number, string>;
export type TacticalCellImageMap = Record<number, string>;
export type TeamTacticalCellImageMap = Record<number, TacticalCellImageMap>;
export type CharacterRandomContextMap = Record<string, ICharacterRandomContext>;

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessageDTO[];
    boardImageMap: BoardImageMap;
    characterRandomContextMap: CharacterRandomContextMap;
    teamTacticalCellImageMap: TeamTacticalCellImageMap;
    teamMembersMap: TeamMembersMap;
    stepIndex: number;
    roomSetting: IRoomSetting;
}
