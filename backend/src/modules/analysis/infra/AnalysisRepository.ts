// src/modules/analysis/infra/AnalysisRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';
import { restoreFiltersFromJson } from '../../match/domain/restoreFilterFromJson';
import { mapCharacter } from '../../character';

import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { IMatchStatisticsOverview } from '../types/IMatchStatisticsOverview';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchLineupSlotCooccurrenceRow } from '../types/IMatchLineupSlotCooccurrenceRow';
import type { IMatchLineupSlotWithTeamMember } from '../types/IMatchLineupSlotWithTeamMember';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import { TeamMember } from '@shared/contracts/team/TeamMember';

export default class AnalysisRepository implements IAnalysisRepository {
    constructor(private prisma: PrismaClient) {}

    async findMatchStatisticsOverview(): Promise<IMatchStatisticsOverview> {
        const [
            matches,
            totalMoves,
            matchLineupSlots,
            dateRange,
            uniqueCharacters,
            uniqueCharacterRarityCounts,
            uniqueCharacterElementCounts,
            memberCount,
            guestCount,
            onlyNameCount,
            moveTypeCounts,
            moveSourceCounts,
        ] = await Promise.all([
            this.prisma.match.findMany({
                select: {
                    id: true,
                    teams: {
                        select: {
                            teamMembers: {
                                select: {
                                    memberRef: true,
                                    guestRef: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.matchMove.count(),
            this.prisma.matchLineupSlot.findMany(matchLineupSlotCooccurrenceRowQuery),
            this.prisma.match.aggregate({
                _min: { createdAt: true },
                _max: { createdAt: true },
            }),
            this.prisma.matchLineupSlot.findMany({
                distinct: ['characterKey'],
                select: { characterKey: true },
            }),
            this.prisma.character.groupBy({
                by: ['rarity'],
                where: {
                    matchLineupSlots: {
                        some: {}, // 至少出現過一次
                    },
                },
                _count: {
                    _all: true,
                },
            }),
            this.prisma.character.groupBy({
                by: ['element'],
                where: {
                    matchLineupSlots: {
                        some: {}, // 至少出現過一次
                    },
                },
                _count: {
                    _all: true,
                },
            }),
            this.prisma.matchTeamMember.findMany({
                where: { memberRef: { not: null } },
                distinct: ['memberRef'],
                select: { memberRef: true },
            }),
            this.prisma.matchTeamMember.findMany({
                where: { guestRef: { not: null } },
                distinct: ['guestRef'],
                select: { guestRef: true },
            }),
            this.prisma.matchTeamMember.findMany({
                where: {
                    memberRef: null,
                    guestRef: null,
                },
                distinct: ['name'],
                select: { name: true },
            }),
            this.prisma.matchMove.groupBy({
                by: ['type'],
                _count: { _all: true },
            }),
            this.prisma.matchMove.groupBy({
                by: ['source'],
                _count: { _all: true },
            }),
        ]);

        const characterRarityGroupCount = this.mapGroupCount(uniqueCharacterRarityCounts, 'rarity');
        const characterElementGroupCount = this.mapGroupCount(uniqueCharacterElementCounts, 'element');

        const moveTypeGroupCount = this.mapGroupCount(moveTypeCounts, 'type');
        const moveSourceGroupCount = this.mapGroupCount(moveSourceCounts, 'source');

        const setupMap = new Map<string, string[]>();

        for (const matchLineupSlot of matchLineupSlots) {
            const setupKey = this.setupKey(matchLineupSlot);

            if (!setupMap.has(setupKey)) {
                setupMap.set(setupKey, []);
            }
            setupMap.get(setupKey)!.push(matchLineupSlot.characterKey);
        }
        const characterCombinationGroupCount = new Map<string, number>();

        for (const characters of setupMap.values()) {
            const signature = characters.sort().join('|');

            characterCombinationGroupCount.set(signature, (characterCombinationGroupCount.get(signature) ?? 0) + 1);
        }

        const uniqueCharacterCombinations = characterCombinationGroupCount.size;
        // const repeatedCombinations = Array.from(characterCombinationGroupCount.entries())
        //     .map(([key, count]) => ({
        //         characters: key.split('|'),
        //         count,
        //     }))
        //     .sort((a, b) => b.count - a.count);

        const teamMemberCombinationGroupCount = new Map<string, number>();
        for (const match of matches) {
            for (const matchTeam of match.teams) {
                const signature = matchTeam.teamMembers.map(this.identityKey).sort().join('|');
                teamMemberCombinationGroupCount.set(signature, (teamMemberCombinationGroupCount.get(signature) ?? 0) + 1);
            }
        }
        const uniqueTeamMemberCombinations = teamMemberCombinationGroupCount.size;

        const versions = await this.prisma.genshinVersion.findMany({
            where: {
                startAt: { lte: dateRange._max.createdAt! },
                OR: [{ endAt: null }, { endAt: { gte: dateRange._min.createdAt! } }],
            },
            orderBy: { order: 'asc' },
            select: {
                order: true,
                code: true,
                name: true,
            },
        });

        return {
            totalMatches: matches.length,
            uniqueCharacterCombinations,
            uniqueTeamMemberCombinations,
            uniqueCharacters: {
                total: uniqueCharacters.length,
                byRarity: {
                    fourStar: characterRarityGroupCount.FourStar,
                    fiveStar: characterRarityGroupCount.FiveStar,
                },
                byElement: {
                    anemo: characterElementGroupCount.Anemo,
                    geo: characterElementGroupCount.Geo,
                    electro: characterElementGroupCount.Electro,
                    dendro: characterElementGroupCount.Dendro,
                    hydro: characterElementGroupCount.Hydro,
                    pryo: characterElementGroupCount.Pyro,
                    cryo: characterElementGroupCount.Cryo,
                    none: characterElementGroupCount.None,
                },
            },
            uniquePlayers: {
                member: memberCount.length,
                guest: guestCount.length,
                onlyName: onlyNameCount.length,
            },
            moves: {
                total: totalMoves,
                byType: {
                    ban: moveTypeGroupCount.Ban,
                    pick: moveTypeGroupCount.Pick,
                    utility: moveTypeGroupCount.Utility,
                },
                bySource: {
                    random: moveSourceGroupCount.Random,
                    manual: moveSourceGroupCount.Manual,
                },
            },
            dateRange: {
                from: dateRange._min.createdAt!,
                to: dateRange._max.createdAt!,
            },
            versionSpan: {
                total: versions.length,
                from: versions[0],
                to: versions[versions.length - 1],
            },
        };
    }

    async findMatchMinimalTimestamps(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTimeMinimal[]> {
        return await this.prisma.match.findMany({
            where: timeWindow ? this.buildMatchTimeWindowWhere(timeWindow) : undefined,
            select: { id: true, createdAt: true },
        });
    }

    async findMatchMoveCoreForWeightCalc(timeWindow?: IAnalysisTimeWindow): Promise<IMatchMoveWeightCalcCore[]> {
        type Entity = Prisma.MatchMoveGetPayload<typeof matchMoveWeightCalcCoreQuery>;

        const entities: Entity[] = await this.prisma.matchMove.findMany({
            ...matchMoveWeightCalcCoreQuery,
            where: { match: timeWindow ? this.buildMatchTimeWindowWhere(timeWindow) : undefined },
        });

        return entities.map((entity) => {
            let randomMoveContext:
                | {
                      id: number;
                      filters: Record<CharacterFilterKey, string[]>;
                      matchMoveId: number;
                  }
                | undefined;
            if (entity.randomMoveContext) {
                randomMoveContext = {
                    id: entity.randomMoveContext.id,
                    filters: restoreFiltersFromJson(entity.randomMoveContext.filters),
                    matchMoveId: entity.randomMoveContext.matchMoveId,
                };
            } else {
                randomMoveContext = undefined;
            }

            return {
                characterKey: entity.characterKey,
                type: entity.type as MoveType,
                source: entity.source as MoveSource,
                matchId: entity.matchId,
                order: entity.order,
                characterReleaseAt: entity.character.releaseAt ?? undefined,
                randomMoveContext: randomMoveContext,
            };
        });
    }

    async findMatchLineupSlotsWithTeamMember(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotWithTeamMember[]> {
        type Entity = Prisma.MatchLineupSlotGetPayload<typeof matchLineupSlotTeamMemberIdentityRefsQuery>;

        const entities: Entity[] = await this.prisma.matchLineupSlot.findMany({
            ...matchLineupSlotTeamMemberIdentityRefsQuery,
            where: playerIdentity ? this.buildPlayerIdentityWhere(playerIdentity) : undefined,
        });

        return entities.map((entity) => {
            let teamMember: TeamMember
            if (entity.teamMember.memberRef && entity.teamMember.member) {
                teamMember = { type: 'Member', id: entity.teamMember.memberRef, nickname: entity.teamMember.member.nickname };
            } else if (entity.teamMember.guestRef && entity.teamMember.guest) {
                teamMember = { type: 'Guest', id: entity.teamMember.guestRef, nickname: entity.teamMember.guest.nickname };
            } else {
                teamMember = { type: 'Name', name: entity.teamMember.name };
            }
            return {
                teamMember,
                characterKey: entity.characterKey
            }
        });
    }

    async findMatchLineupSlotsForCooccurrence(timeWindow?: IAnalysisTimeWindow): Promise<IMatchLineupSlotCooccurrenceRow[]> {
        type Entity = Prisma.MatchLineupSlotGetPayload<typeof matchLineupSlotCooccurrenceRowQuery>;

        const entities: Entity[] = await this.prisma.matchLineupSlot.findMany({
            ...matchLineupSlotCooccurrenceRowQuery,
            where: {
                teamMember: {
                    team: {
                        match: timeWindow ? this.buildMatchTimeWindowWhere(timeWindow) : undefined,
                    },
                },
            },
        });

        return entities.map((entity) => ({
            matchId: entity.teamMember.team.matchId,
            teamId: entity.teamMember.teamId,
            setupNumber: entity.setupNumber,
            characterKey: entity.characterKey,
        }));
    }

    async findMatchLineupSlotsWithCharacter(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotWithCharacter[]> {
        const entities = await this.prisma.matchLineupSlot.findMany({
            include: {
                character: true,
            },
            where: playerIdentity ? this.buildPlayerIdentityWhere(playerIdentity) : undefined,
        });

        return entities.map((entity) => ({
            characterKey: entity.characterKey,
            character: mapCharacter(entity.character),
        }));
    }

    private buildMatchTimeWindowWhere(timeWindow: IAnalysisTimeWindow): { createdAt: Prisma.DateTimeFilter<never> } | undefined {
        const filter: Prisma.DateTimeFilter = {};

        if (timeWindow.startAt) {
            filter.gte = timeWindow.startAt;
        }

        if (timeWindow.endAt) {
            filter.lte = timeWindow.endAt;
        }

        return Object.keys(filter).length > 0 ? { createdAt: filter } : undefined;
    }

    private buildPlayerIdentityWhere(playerIdentity: PlayerIdentity): Prisma.MatchLineupSlotWhereInput {
        switch (playerIdentity.type) {
            case 'Member':
                return { teamMember: { memberRef: playerIdentity.id } };
            case 'Guest':
                return { teamMember: { guestRef: playerIdentity.id } };
            case 'Name':
                return { teamMember: { name: playerIdentity.name } };
        }
    }

    mapGroupCount<K extends string, T extends string>(rows: Array<Record<K, T> & { _count: { _all: number } }>, key: K): Record<T, number> {
        return rows.reduce(
            (acc, row) => {
                acc[row[key]] = row._count._all;
                return acc;
            },
            {} as Record<T, number>,
        );
    }

    identityKey(m: { memberRef: number | null; guestRef: number | null; name: string }) {
        if (m.memberRef) return `member:${m.memberRef}`;
        if (m.guestRef) return `guest:${m.guestRef}`;
        return `name:${m.name}`;
    }

    setupKey(entity: Prisma.MatchLineupSlotGetPayload<typeof matchLineupSlotCooccurrenceRowQuery>) {
        const matchId = entity.teamMember.team.matchId;
        const teamId = entity.teamMember.teamId;
        const setupNumber = entity.setupNumber;

        const setupKey = `${matchId}|${teamId}|${setupNumber}`;
        return setupKey;
    }
}

const matchMoveWeightCalcCoreQuery = Prisma.validator<Prisma.MatchMoveFindManyArgs>()({
    select: {
        type: true,
        source: true,
        matchId: true,
        order: true,
        characterKey: true,
        character: { select: { releaseAt: true } },
        randomMoveContext: true,
    },
});

const matchLineupSlotTeamMemberIdentityRefsQuery = Prisma.validator<Prisma.MatchLineupSlotFindManyArgs>()({
    include: {
        teamMember: {
            include: {
                member: true,
                guest: true,
            },
        },
    },
});

const matchLineupSlotCooccurrenceRowQuery = Prisma.validator<Prisma.MatchLineupSlotFindManyArgs>()({
    select: {
        setupNumber: true,
        characterKey: true,
        teamMember: {
            select: {
                teamId: true,
                team: {
                    select: {
                        matchId: true,
                    },
                },
            },
        },
    },
});
