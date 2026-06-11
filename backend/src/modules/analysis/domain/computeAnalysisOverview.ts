// backend/src/modules/analysis/domain/computeAnalysisOverview.ts

import { Element, Rarity } from '@shared/contracts/character/value-types';
import { PlayerIdentity, stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import { MoveSource, MoveType } from '@shared/contracts/match/value-types';

import { buildCooccurrenceGroups } from './buildCooccurrenceGroups';

import type { IMatchLineupSlotPlacement } from '../../match/types/IMatchLineupSlotPlacement';
import type { IMatchStatistics } from '../../match/types/IMatchStatistics';
import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';

export function computeAnalysisOverview(statistics: IMatchStatistics, lineupSlotPlacements: IMatchLineupSlotPlacement[]): IAnalysisOverview {
    const uniquePlayers = countUniquePlayers(statistics.teamMemberGroups);
    return {
        volume: {
            matchCount: statistics.matchCount,
            matchCharacterCombinationCount: countCharacterCombinations(lineupSlotPlacements),
            matchTeamMemberCombinationCount: countTeamMemberCombinations(statistics.teamMemberGroups),
            players: {
                total: uniquePlayers.member + uniquePlayers.guest + uniquePlayers.onlyName,
                member: uniquePlayers.member,
                guest: uniquePlayers.guest,
                onlyName: uniquePlayers.onlyName,
            },
            characters: {
                total: countUniqueCharacters(lineupSlotPlacements),
                byRarity: fillCounts(Object.values(Rarity), statistics.characterRarityCounts),
                byElement: fillCounts(Object.values(Element), statistics.characterElementCounts),
            },
            moves: {
                total: statistics.moveCount,
                byType: fillCounts(Object.values(MoveType), statistics.moveTypeCounts),
                bySource: fillCounts(Object.values(MoveSource), statistics.moveSourceCounts),
            },
        },
    };
}

// 把稀疏的計數（groupBy 不會補 0）攤平成涵蓋所有列舉值的完整 Record，缺漏補 0。
function fillCounts<E extends string>(values: E[], partial: Partial<Record<E, number>>): Record<E, number> {
    const result = {} as Record<E, number>;
    for (const value of values) {
        result[value] = partial[value] ?? 0;
    }
    return result;
}

// 以 (match, team, setup) 為一組陣容，計算去重後的角色組合數量。
function countCharacterCombinations(lineupSlotPlacements: IMatchLineupSlotPlacement[]): number {
    const groups = buildCooccurrenceGroups(lineupSlotPlacements, (lineupSlotPlacement) => lineupSlotPlacement.characterKey, 'setup');

    const signatures = new Set<string>();
    for (const characters of Object.values(groups)) {
        signatures.add([...characters].sort().join('|'));
    }
    return signatures.size;
}

// 從 lineup slots 去重計算出場過的不重複角色數。
function countUniqueCharacters(lineupSlotPlacements: IMatchLineupSlotPlacement[]): number {
    return new Set(lineupSlotPlacements.map((lineupSlotPlacement) => lineupSlotPlacement.characterKey)).size;
}

// 從每隊成員身份去重計算不重複玩家數（Member/Guest 依 id、Name 依名稱）。
function countUniquePlayers(teamMemberGroups: PlayerIdentity[][]): { member: number; guest: number; onlyName: number } {
    const members = new Set<number>();
    const guests = new Set<number>();
    const names = new Set<string>();
    for (const group of teamMemberGroups) {
        for (const player of group) {
            if (player.type === 'Member') members.add(player.id);
            else if (player.type === 'Guest') guests.add(player.id);
            else names.add(player.name);
        }
    }
    return { member: members.size, guest: guests.size, onlyName: names.size };
}

// 計算去重後的隊伍成員組合數量。
function countTeamMemberCombinations(teamMemberGroups: PlayerIdentity[][]): number {
    const signatures = new Set<string>();
    for (const teamMembers of teamMemberGroups) {
        signatures.add(teamMembers.map(stringifyPlayerIdentity).sort().join('|'));
    }
    return signatures.size;
}
