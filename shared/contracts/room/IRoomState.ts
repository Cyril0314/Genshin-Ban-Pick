import type { CharacterRandomContextMap } from '../character/CharacterRandomContextMap';
import type { IChatMessage } from '../chat/IChatMessage';
import type { BoardImageMap } from '../board/BoardImageMap';
import type { TeamTacticalCellImageMap } from '../tactical/TeamTacticalCellImageMap';
import type { TeamMembersMap } from '../team/TeamMembersMap';
import type { IRoomSetting } from './IRoomSetting';
import type { IRoomUser } from './IRoomUser';

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessage[];
    boardImageMap: BoardImageMap;
    characterRandomContextMap: CharacterRandomContextMap;
    teamTacticalCellImageMap: TeamTacticalCellImageMap;
    teamMembersMap: TeamMembersMap;
    roomSetting: IRoomSetting;
}
