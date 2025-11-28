// src/modules/match/domain/IMatchSnapshot.ts

import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { TeamTacticalCellImageMap } from '@shared/contracts/tactical/TeamTacticalCellImageMap';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';

export interface IMatchSnapshot {
    roomId: string;

    roomSetting: IRoomSetting;

    teamMembersMap: TeamMembersMap;

    boardImageMap: BoardImageMap;

    teamTacticalCellImageMap: TeamTacticalCellImageMap;

    characterRandomContextMap: CharacterRandomContextMap;
}
