// backend/src/modules/analyses/application/tactical/computeTacticalUsage.ts

import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client/extension';
import { getWeightContext } from './getWeightContext';
import { calculateTacticalWeight } from './calculateTacticalWeight';

export async function computeTacticalUsage(prisma: PrismaClient) {
    type Match = Prisma.MatchGetPayload<{ select: { id: true; createdAt: true } }>;
    
    type MatchMove = Prisma.MatchMoveGetPayload<{ 
        select: {
            type: true,
            source: true,
            matchId: true,
            characterKey: true,
            match: { 
                select: { 
                    createdAt: true 
                } 
            },
            character: { 
                select: {
                     releaseDate: true 
                    } 
                },
            randomMoveContext: true,
        },
     }>;
    
    type MatchTacticalUsage = Prisma.MatchTacticalUsageGetPayload<{ 
        select: {
            characterKey: true,
            teamMember: {
                select: {
                    team: {
                        select: {
                            matchId: true,
                        },
                    },
                },
            },
        }
     }>;

    const matches: Match[] = await prisma.match.findMany({
        select: { id: true, createdAt: true },
    });
    const matchCount = matches.length;

    const matchMoves: MatchMove[] = await prisma.matchMove.findMany({
        select: {
            type: true,
            source: true,
            matchId: true,
            characterKey: true,
            match: { 
                select: {
                     createdAt: true
                    }
                },
            character: { 
                select: { 
                    releaseDate: true 
                } 
            },
            randomMoveContext: true,
        },
    });

    const matchTacticalUsages: MatchTacticalUsage[] = await prisma.matchTacticalUsage.findMany({
        select: {
            characterKey: true,
            teamMember: {
                select: {
                    team: {
                        select: {
                            matchId: true,
                        },
                    },
                },
            },
        },
    });

    const usedSet = new Set(matchTacticalUsages.map((u) => `${u.teamMember.team.matchId}:${u.characterKey}`));

    const usageCountByMatch = new Map<string, number>();
    for (const u of matchTacticalUsages) {
        const key = `${u.teamMember.team.matchId}:${u.characterKey}`;
        usageCountByMatch.set(key, (usageCountByMatch.get(key) ?? 0) + 1);
    }

    const weights = new Map<string, number>();
    const contextMap = new Map<string, any>();
    const releaseMap = new Map<string, Date | null>();

    for (const matchMove of matchMoves) {
        const key = matchMove.characterKey;
        const matchId = matchMove.matchId;
        const matchDate = matchMove.match.createdAt;
        const releaseDate = matchMove.character.releaseDate;
        const wasUsed = usedSet.has(`${matchId}:${key}`);
        const usedBoth = (usageCountByMatch.get(`${matchId}:${key}`) ?? 0) >= 2;

        releaseMap.set(key, matchMove.character.releaseDate ?? null);

        if (releaseDate && releaseDate > matchDate) continue;

        const ctx = getWeightContext({
            type: matchMove.type,
            source: matchMove.source,
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
