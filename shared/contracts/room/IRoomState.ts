import type { CharacterRandomContextMap } from '../character/CharacterRandomContextMap';
import type { IChatMessageDTO } from '../chat/IChatMessageDTO';
import type { BoardImageMap } from '../board/BoardImageMap';
import type { TeamTacticalCellImageMap } from '../tactical/TeamTacticalCellImageMap';
import type { TeamMembersMap } from '../team/TeamMembersMap';
import type { IRoomSetting } from './IRoomSetting';
import type { IRoomUser } from './IRoomUser';

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
