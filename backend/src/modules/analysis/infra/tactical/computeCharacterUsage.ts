// backend/src/modules/analysis/infra/tactical/computeCharacterTacticalUsage.ts

import { aggregateMoveWeightContext } from './aggregateMoveWeightContext';
import { calculateTacticalWeight } from './calculateTacticalWeight';

import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';
import type { IMatchTacticalUsageExpandedRefs } from '../../types/IMatchTacticalUsageExpandedRefs';
import type { IMatchMoveWeightCalcCore } from '../../types/IMatchMoveWeightCalcCore';
import type { IWeightContext } from '@shared/contracts/analysis/IWeightContext';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';

export function computeCharacterUsage(matches: IMatchTimeMinimal[], matchMoves: IMatchMoveWeightCalcCore[], matchTacticalUsages: IMatchTacticalUsageExpandedRefs[]): ICharacterUsage[] {
    const matchCount = matches.length;

    const usedSet = new Set(matchTacticalUsages.map((u) => `${u.matchId}:${u.characterKey}`));

    const usageCountByMatch = new Map<string, number>();
    for (const u of matchTacticalUsages) {
        const key = `${u.matchId}:${u.characterKey}`;
        usageCountByMatch.set(key, (usageCountByMatch.get(key) ?? 0) + 1);
    }

    const weights = new Map<string, number>();
    const contextMap = new Map<string, IWeightContext>();
    const releaseMap = new Map<string, Date | undefined>();

    for (const matchMove of matchMoves) {
        const key = matchMove.characterKey;
        const matchId = matchMove.matchId;
        const wasUsed = usedSet.has(`${matchId}:${key}`);
        const usedBoth = (usageCountByMatch.get(`${matchId}:${key}`) ?? 0) >= 2;

        releaseMap.set(key, matchMove.characterReleaseAt ?? undefined);

        const ctx = aggregateMoveWeightContext({
            type: matchMove.type,
            source: matchMove.source,
            wasUsed,
            usedByBothTeams: usedBoth,
        });

        const w = calculateTacticalWeight(ctx);

        weights.set(key, (weights.get(key) ?? 0) + w);

        const prev = contextMap.get(key);

        if (!prev) {
            contextMap.set(key, JSON.parse(JSON.stringify(ctx)));
        } else {
            mergeContext(prev, ctx);
            contextMap.set(key, prev);
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

    return Array.from(weights.entries())
        .map(([key, totalWeight]) => {
            const valid = effectiveMatchCount.get(key) ?? 1;

            const globalUsage = totalWeight / matchCount;
            const effectiveUsage = totalWeight / valid;
            const adjustedUsage = effectiveUsage;

            const stability = 1 - Math.exp(-valid / 30);
            const tacticalUsage = globalUsage * stability + adjustedUsage * (1 - stability);

            return {
                characterKey: key,
                tacticalUsage,
                globalUsage,
                effectiveUsage,
                validMatchCount: valid,
                context: contextMap.get(key),
            };
        })
        .sort((a, b) => b.tacticalUsage - a.tacticalUsage);
}

function mergeContext(prev: any, add: any) {
    for (const key of Object.keys(add)) {
        const group = add[key];
        for (const f of Object.keys(group)) {
            prev[key][f] += group[f];
        }
    }
}
