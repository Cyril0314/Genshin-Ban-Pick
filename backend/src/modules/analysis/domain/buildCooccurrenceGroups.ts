// backend/src/modules/analysis/domain/buildCooccurrenceGroups.ts

import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';

// grain 分組所需的座標（match / team / setup）。setupNumber 只有 'setup' grain 用得到，
// team member 沒有編成維度，故為 optional。
interface IGrainCoordinates {
    matchId: number;
    teamId: number;
    setupNumber?: number;
}

// 按 grain 把 rows 分組，每組 = 該 grain 單位內的 member key 陣列。
export function buildCooccurrenceGroups<T extends IGrainCoordinates>(
    rows: T[],
    memberKeyOf: (row: T) => string,
    grain: CooccurrenceGrain,
): Record<string, string[]> {
    const groups: Record<string, string[]> = {};

    for (const row of rows) {
        const key = buildCooccurrenceGroupKey(row, grain);
        (groups[key] ??= []).push(memberKeyOf(row));
    }

    return groups;
}

function buildCooccurrenceGroupKey(coords: IGrainCoordinates, grain: CooccurrenceGrain): string {
    switch (grain) {
        case 'match':
            // 一場比賽當作一個 group
            return `${coords.matchId}`;
        case 'team':
            // 一場比賽 + 一隊當作一個 group
            return `${coords.matchId}:${coords.teamId}`;
        case 'setup':
            // 一場比賽 + 一隊 + 一個編成當作一個 group
            return `${coords.matchId}:${coords.teamId}:${coords.setupNumber}`;
    }
}
