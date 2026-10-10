// backend/src/modules/room/domain/createRoomSetting.ts

import { InvalidRoomSettingError } from '../../../errors/AppError';
import { alignZoneCountToRounds, deriveNumberOfTeamSetup, NUMBER_OF_TEAMS } from '@shared/contracts/room/roomSettingRules';
import { createDefaultTeams } from './createDefaultTeams';
import { createMatchFlow } from './createMatchFlow';
import { createZoneMetaTable } from './createZoneMetaTable';

import type { IRoomSetting } from '@shared/contracts/room/IRoomSetting';
import type { ITeam } from '@shared/contracts/team/ITeam';

const defaultFlowVersion = 1;
const defaultTotalRounds = 2;
const defaultNumberOfUtility = 4;
const defaultNumberOfBan = 8;
const defaultNumberOfPick = 32;

const defaultTeams = createDefaultTeams();
const defaultLineupVersion = 1;
const defaultNumberOfSetupCharacter = 4;

export function createRoomSetting({
    numberOfUtility,
    numberOfBan,
    numberOfPick,
    totalRounds,
    teams,
    numberOfSetupCharacter,
}: {
    numberOfUtility?: number;
    numberOfBan?: number;
    numberOfPick?: number;
    totalRounds?: number;
    teams?: ITeam[];
    numberOfSetupCharacter?: number;
}): IRoomSetting {
    // payload 直接來自 req.body，沒有驗證就進到除法 / lcm / zone 迴圈會算出 Infinity 或建無限個 zone
    const rounds = totalRounds ?? defaultTotalRounds;
    const charactersPerSetup = numberOfSetupCharacter ?? defaultNumberOfSetupCharacter;
    const utilityCount = numberOfUtility ?? defaultNumberOfUtility;
    const banCount = numberOfBan ?? defaultNumberOfBan;
    const pickCount = numberOfPick ?? defaultNumberOfPick;
    const resolvedTeams = teams ?? defaultTeams;
    if (!isPositiveInteger(rounds) || !isPositiveInteger(charactersPerSetup)) {
        throw new InvalidRoomSettingError();
    }
    if (![utilityCount, banCount, pickCount].every(isNonNegativeInteger)) {
        throw new InvalidRoomSettingError();
    }
    if (!Array.isArray(resolvedTeams) || resolvedTeams.length !== NUMBER_OF_TEAMS) {
        throw new InvalidRoomSettingError();
    }

    // 房主填的 Ban/Pick 數量補到每回合等量且為偶數，流程才切得乾淨；Pick 還要排得滿整組陣容
    const alignedNumberOfBan = alignZoneCountToRounds(banCount, rounds);
    const alignedNumberOfPick = alignZoneCountToRounds(pickCount, rounds, charactersPerSetup);
    const numberOfTeamSetup = deriveNumberOfTeamSetup(alignedNumberOfPick, charactersPerSetup);

    const zoneMetaTable = createZoneMetaTable({
        numberOfUtility: utilityCount,
        numberOfBan: alignedNumberOfBan,
        numberOfPick: alignedNumberOfPick,
    });
    const matchFlow = createMatchFlow(defaultFlowVersion, zoneMetaTable, rounds, resolvedTeams);

    return {
        zoneMetaTable,
        matchFlow,

        flowVersion: defaultFlowVersion,
        totalRounds: rounds,
        numberOfUtility: utilityCount,
        numberOfBan: alignedNumberOfBan,
        numberOfPick: alignedNumberOfPick,
        teams: resolvedTeams,
        lineupVersion: defaultLineupVersion,
        numberOfTeamSetup,
        numberOfSetupCharacter: charactersPerSetup,
    };
}

function isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 1;
}

function isNonNegativeInteger(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 0;
}
