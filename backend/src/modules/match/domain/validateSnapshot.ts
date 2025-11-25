// src/modules/match/domain/validateSnapshot.ts

import { InvalidFieldsError } from '../../../errors/AppError.ts';
import { IMatchSnapshot } from './IMatchSnapshot.ts';

export function validateSnapshot(snapshot: IMatchSnapshot) {
    const { roomSetting, teamMembersMap, boardImageMap, teamTacticalCellImageMap } = snapshot;

    // Team 成員驗證
    for (const [teamSlotString, teamMembers] of Object.entries(teamMembersMap)) {
        if (Object.values(teamMembers).length !== roomSetting.numberOfTeamSetup) {
            throw new InvalidFieldsError();
        }
    }

    // Board 驗證
    const totalZonesCount = Object.values(roomSetting.zoneMetaTable).length;
    if (Object.values(boardImageMap).length !== totalZonesCount) {
        throw new InvalidFieldsError();
    }

    // Tactical 驗證
    for (const tacticalCellImageMap of Object.values(teamTacticalCellImageMap)) {
        const totalCells = roomSetting.numberOfSetupCharacter * roomSetting.numberOfTeamSetup;
        if (Object.values(tacticalCellImageMap).length !== totalCells) {
            throw new InvalidFieldsError();
        }
    }
}
