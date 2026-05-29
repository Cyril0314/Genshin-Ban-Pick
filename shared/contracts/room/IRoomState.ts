import type { CharacterRandomContextMap } from '../character/CharacterRandomContextMap';
import type { IChatMessage } from '../chat/IChatMessage';
import type { BoardImageMap } from '../board/BoardImageMap';
import type { TeamLineupImageMap } from '../lineup/TeamLineupImageMap';
import type { TeamMembersMap } from '../team/TeamMembersMap';
import type { IRoomSetting } from './IRoomSetting';
import type { IRoomUser } from './IRoomUser';

export interface IRoomState {
    users: IRoomUser[];
    chatMessages: IChatMessage[];
    boardImageMap: BoardImageMap;
    characterRandomContextMap: CharacterRandomContextMap;
    teamLineupImageMap: TeamLineupImageMap;
    teamMembersMap: TeamMembersMap;
    roomSetting: IRoomSetting;
}
