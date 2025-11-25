// backend/src/modules/room/domain/IRoomState.ts

import { ICharacterRandomContext } from '../../../types/ICharacterRandomContext.ts';
import { IChatMessageDTO } from '../../../types/IChatMessageDTO.ts';
import { TeamMembersMap } from '../../../types/TeamMember.ts';
import { IRoomSetting } from './IRoomSetting.ts';
import { IRoomUser } from '../types/IRoomUser.ts';

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
