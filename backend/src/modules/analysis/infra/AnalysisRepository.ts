// src/modules/analysis/infra/AnalysisRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';
import { restoreFiltersFromJson } from '../../match/domain/restoreFilterFromJson';
import { mapTeamMember } from '../../match/domain/mapTeamMember';
import { mapCharacter } from '../../character';

import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { IMatchStatisticsRaw } from '../types/IMatchStatisticsRaw';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchLineupSlotCooccurrenceRow } from '../types/IMatchLineupSlotCooccurrenceRow';
import type { IMatchLineupSlotWithTeamMember } from '../types/IMatchLineupSlotWithTeamMember';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';

export default class AnalysisRepository implements IAnalysisRepository {
    constructor(private prisma: PrismaClient) {}

    async findMatchStatisticsRaw(): Promise<IMatchStatisticsRaw> {
        const [
            matches,
            moveCount,
            uniqueCharacterRarityCounts,
            uniqueCharacterElementCounts,
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
            this.prisma.character.groupBy({
                by: ['rarity'],
                where: {
                    matchLineupSlots: {
                        some: {}, // 至少出現過一次
                    },
                },
                _count: { _all: true },
            }),
            this.prisma.character.groupBy({
                by: ['element'],
                where: {
                    matchLineupSlots: {
                        some: {}, // 至少出現過一次
                    },
                },
                _count: { _all: true },
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

        return {
            matchCount: matches.length,
            moveCount: moveCount,
            teamMemberGroups: matches.flatMap((match) => match.teams.map((team) => team.teamMembers.map(this.mapPlayerIdentity))),
            characterRarityCounts: this.mapGroupCount(uniqueCharacterRarityCounts, 'rarity'),
            characterElementCounts: this.mapGroupCount(uniqueCharacterElementCounts, 'element'),
            moveTypeCounts: this.mapGroupCount(moveTypeCounts, 'type'),
            moveSourceCounts: this.mapGroupCount(moveSourceCounts, 'source'),
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

        return entities.map((entity) => ({
            teamMember: mapTeamMember(entity.teamMember),
            characterKey: entity.characterKey,
        }));
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

    private mapPlayerIdentity(member: { memberRef: number | null; guestRef: number | null; name: string }): PlayerIdentity {
        if (member.memberRef) return { type: 'Member', id: member.memberRef };
        if (member.guestRef) return { type: 'Guest', id: member.guestRef };
        return { type: 'Name', name: member.name };
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

    private mapGroupCount<Row extends { _count: { _all: number } }>(rows: Row[], key: keyof Row): Record<string, number> {
        return rows.reduce(
            (acc, row) => {
                acc[String(row[key])] = row._count._all;
                return acc;
            },
            {} as Record<string, number>,
        );
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
