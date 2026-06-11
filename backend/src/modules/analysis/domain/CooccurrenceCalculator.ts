// backend/src/modules/analysis/domain/CooccurrenceCalculator.ts

import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';

// grain 分組所需的座標（match / team / setup）
interface IGrainCoordinates {
    matchId: number;
    teamId: number;
    setupNumber: number;
}

export default class CooccurrenceCalculator {
    buildCooccurrenceGroups<T extends IGrainCoordinates>(
        rows: T[],
        memberKeyOf: (row: T) => string,
        grain: CooccurrenceGrain,
    ): Record<string, string[]> {
        const groups: Record<string, string[]> = {};

        for (const row of rows) {
            const key = this.buildCooccurrenceGroupKey(row, grain);
            (groups[key] ??= []).push(memberKeyOf(row));
        }

        return groups;
    }

    private buildCooccurrenceGroupKey(coords: IGrainCoordinates, grain: CooccurrenceGrain): string {
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
}
