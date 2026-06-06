// backend/src/modules/analysis/domain/computeAnalysisOverview.ts

import { Element, Rarity } from '@shared/contracts/character/value-types';
import { MoveSource, MoveType } from '@shared/contracts/match/value-types';
import { PlayerIdentity, stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import type { IMatchStatisticsRaw } from '../types/IMatchStatisticsRaw';
import type { IMatchLineupSlotCooccurrenceRow } from '../types/IMatchLineupSlotCooccurrenceRow';
import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';

export function computeAnalysisOverview(raw: IMatchStatisticsRaw, cooccurrenceRows: IMatchLineupSlotCooccurrenceRow[]): IAnalysisOverview {
    const uniquePlayers = countUniquePlayers(raw.teamMemberGroups);
    return {
        volume: {
            matchCount: raw.matchCount,
            matchCharacterCombinationCount: countCharacterCombinations(cooccurrenceRows),
            matchTeamMemberCombinationCount: countTeamMemberCombinations(raw.teamMemberGroups),
            players: {
                total: uniquePlayers.member + uniquePlayers.guest + uniquePlayers.onlyName,
                member: uniquePlayers.member,
                guest: uniquePlayers.guest,
                onlyName: uniquePlayers.onlyName,
            },
            characters: {
                total: countUniqueCharacters(cooccurrenceRows),
                byRarity: fillCounts(Object.values(Rarity), raw.characterRarityCounts),
                byElement: fillCounts(Object.values(Element), raw.characterElementCounts),
            },
            moves: {
                total: raw.moveCount,
                byType: fillCounts(Object.values(MoveType), raw.moveTypeCounts),
                bySource: fillCounts(Object.values(MoveSource), raw.moveSourceCounts),
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
function countCharacterCombinations(rows: IMatchLineupSlotCooccurrenceRow[]): number {
    const setupMap = new Map<string, string[]>();
    for (const row of rows) {
        const setupKey = `${row.matchId}|${row.teamId}|${row.setupNumber}`;
        let characters = setupMap.get(setupKey);
        if (!characters) {
            characters = [];
            setupMap.set(setupKey, characters);
        }
        characters.push(row.characterKey);
    }

    const signatures = new Set<string>();
    for (const characters of setupMap.values()) {
        signatures.add(characters.sort().join('|'));
    }
    return signatures.size;
}

// 從 lineup slots 去重計算出場過的不重複角色數。
function countUniqueCharacters(rows: IMatchLineupSlotCooccurrenceRow[]): number {
    return new Set(rows.map((row) => row.characterKey)).size;
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
