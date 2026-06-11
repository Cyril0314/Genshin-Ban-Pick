// backend/src/modules/analysis/domain/computeCharacterUsage.ts

import { aggregateMoveWeightContext } from './aggregateMoveWeightContext';
import { calculateTacticalWeight } from './calculateTacticalWeight';

import type { IMatchTimestamp } from '@shared/contracts/match/IMatchTimestamp';
import type { IMatchMove } from '@shared/contracts/match/IMatchMove';
import type { IWeightContext } from '@shared/contracts/analysis/IWeightContext';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';

export function computeCharacterUsage(
    matches: IMatchTimestamp[],
    matchMoves: IMatchMove[],
    matchLineupSlots: { matchId: number; characterKey: string }[],
): ICharacterUsage[] {
    const matchCount = matches.length;

    const usedSet = new Set(matchLineupSlots.map((u) => `${u.matchId}:${u.characterKey}`));

    const usageCountByMatch = new Map<string, number>();
    for (const u of matchLineupSlots) {
        const key = `${u.matchId}:${u.characterKey}`;
        usageCountByMatch.set(key, (usageCountByMatch.get(key) ?? 0) + 1);
    }

    const aggregates = new Map<string, { totalWeight: number; context: IWeightContext }>();
    const releaseMap = new Map<string, Date | undefined>();

    for (const matchMove of matchMoves) {
        const key = matchMove.characterKey;
        const matchId = matchMove.matchId;
        const wasUsed = usedSet.has(`${matchId}:${key}`);
        const usedBoth = (usageCountByMatch.get(`${matchId}:${key}`) ?? 0) >= 2;

        releaseMap.set(key, matchMove.character?.releaseAt ?? undefined);

        const ctx = aggregateMoveWeightContext({
            type: matchMove.type,
            source: matchMove.source,
            wasUsed,
            usedByBothTeams: usedBoth,
        });

        const w = calculateTacticalWeight(ctx);

        const existing = aggregates.get(key);
        if (!existing) {
            aggregates.set(key, { totalWeight: w, context: JSON.parse(JSON.stringify(ctx)) });
        } else {
            existing.totalWeight += w;
            mergeContext(existing.context, ctx);
        }
    }

    const sortedMatches = matches.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const effectiveMatchCount = new Map<string, number>();

    for (const [key, releaseAt] of releaseMap.entries()) {
        if (!releaseAt) {
            effectiveMatchCount.set(key, matchCount);
            continue;
        }
        const idx = sortedMatches.findIndex((m) => m.createdAt >= releaseAt);
        effectiveMatchCount.set(key, idx === -1 ? matchCount : matchCount - idx);
    }

    return Array.from(aggregates.entries())
        .map(([key, { totalWeight, context }]) => {
            const valid = effectiveMatchCount.get(key) ?? 1;

            const globalUsage = totalWeight / matchCount;
            const effectiveUsage = totalWeight / valid;

            const stability = 1 - Math.exp(-valid / 30);
            const adjustedUsage = globalUsage * stability + effectiveUsage * (1 - stability);

            return {
                characterKey: key,
                adjustedUsage,
                globalUsage,
                effectiveUsage,
                validMatchCount: valid,
                context,
            };
        })
        .sort((a, b) => b.adjustedUsage - a.adjustedUsage);
}

function mergeContext(prev: any, add: any) {
    for (const key of Object.keys(add)) {
        const group = add[key];
        for (const f of Object.keys(group)) {
            prev[key][f] += group[f];
        }
    }
}
