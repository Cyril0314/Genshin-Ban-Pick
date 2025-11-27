// backend/src/modules/room/domain/createRoomState.ts

import { ITeam } from '@shared/contracts/team/ITeam';
import { IRoomSetting } from '@shared/contracts/room/IRoomSetting';

export function createRoomState(roomSetting: IRoomSetting) {
    return {
        users: [],
        chatMessages: [],
        boardImageMap: {},
        characterRandomContextMap: {},
        teamMembersMap: initializeTeamMembersMap(roomSetting.teams),
        teamTacticalCellImageMap: initializeTeamTacticalCellImageMap(roomSetting.teams),
        stepIndex: 0,
        roomSetting,
    };
}

function initializeTeamMembersMap(teams: ITeam[]) {
    return Object.fromEntries(teams.map((t) => [t.slot, {}]))
}

function initializeTeamTacticalCellImageMap(teams: ITeam[]) {
    return Object.fromEntries(teams.map((t) => [t.slot, {}]))
}
