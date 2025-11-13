import { PrismaClient } from '@prisma/client/extension';
import { getWeightContext } from './getWeightContext.ts';
import { calculateTacticalWeight } from './calculateTacticalWeight.ts';

export async function computeTacticalUsage(prisma: PrismaClient) {
    const matches = await prisma.match.findMany({
        select: { id: true, createdAt: true },
    });
    const matchCount = matches.length;

    const moves = await prisma.matchMove.findMany({
        select: {
            type: true,
            source: true,
            matchId: true,
            characterKey: true,
            match: { select: { createdAt: true } },
            character: { select: { releaseDate: true } },
            randomMoveContext: true,
        },
    });

    const usages = await prisma.matchTacticalUsage.findMany({
        select: {
            characterKey: true,
            teamMember: { select: { team: { select: { matchId: true } } } },
        },
    });

    const usedSet = new Set(usages.map((u) => `${u.teamMember.team.matchId}:${u.characterKey}`));

    const usageCountByMatch = new Map<string, number>();
    for (const u of usages) {
        const key = `${u.teamMember.team.matchId}:${u.characterKey}`;
        usageCountByMatch.set(key, (usageCountByMatch.get(key) ?? 0) + 1);
    }

    const weights = new Map<string, number>();
    const contextMap = new Map<string, any>();
    const releaseMap = new Map<string, Date | null>();

    for (const move of moves) {
        const key = move.characterKey;
        const matchId = move.matchId;

        const wasUsed = usedSet.has(`${matchId}:${key}`);
        const usedBoth = (usageCountByMatch.get(`${matchId}:${key}`) ?? 0) >= 2;

        releaseMap.set(key, move.character.releaseDate ?? null);

        if (move.character.releaseDate && move.character.releaseDate > move.match.createdAt) continue;

        const ctx = getWeightContext({
            type: move.type,
            source: move.source,
            wasUsed,
            usedByBothTeams: usedBoth,
        });

        const w = calculateTacticalWeight(ctx);

        weights.set(key, (weights.get(key) ?? 0) + w);

        const prev = contextMap.get(key) ?? JSON.parse(JSON.stringify(ctx));
        mergeContext(prev, ctx);
        contextMap.set(key, prev);
    }

    const sortedMatches = matches.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const effectiveMatchCount = new Map<string, number>();

    for (const [key, releaseDate] of releaseMap.entries()) {
        if (!releaseDate) {
            effectiveMatchCount.set(key, matchCount);
            continue;
        }
        const idx = sortedMatches.findIndex((m) => m.createdAt >= releaseDate);
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
