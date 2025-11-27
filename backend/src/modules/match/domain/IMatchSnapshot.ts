// src/modules/match/domain/IMatchSnapshot.ts

import { IRoomSetting } from '@shared/contracts/room/IRoomSetting';
import { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import { TeamTacticalCellImageMap } from '@shared/contracts/tactical/TeamTacticalCellImageMap';
import { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';

export interface IMatchSnapshot {
    roomId: string;

    roomSetting: IRoomSetting;

    teamMembersMap: TeamMembersMap;

    boardImageMap: BoardImageMap;

    teamTacticalCellImageMap: TeamTacticalCellImageMap;

    characterRandomContextMap: CharacterRandomContextMap;
}
