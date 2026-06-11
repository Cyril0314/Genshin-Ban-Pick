// src/modules/match/infra/MatchReadModel.ts

import { Prisma, PrismaClient } from '@prisma/client';
import { mapCharacter } from '../../character';
import { buildMatchTeamMemberWhere } from './buildMatchTeamMemberWhere';

import type { IMatchReadModel } from '../domain/IMatchReadModel';
import type { IMatchStatisticsRaw } from '../types/IMatchStatisticsRaw';
import type { IMatchLineupSlotPlacement } from '../types/IMatchLineupSlotPlacement';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';

export default class MatchReadModel implements IMatchReadModel {
    constructor(private prisma: PrismaClient) {}

    async findMatchStatisticsRaw(): Promise<IMatchStatisticsRaw> {
        const [matches, moveCount, uniqueCharacterRarityCounts, uniqueCharacterElementCounts, moveTypeCounts, moveSourceCounts] = await Promise.all([
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
                        some: {},
                    },
                },
                _count: { _all: true },
            }),
            this.prisma.character.groupBy({
                by: ['element'],
                where: {
                    matchLineupSlots: {
                        some: {},
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

    async findMatchLineupSlotPlacements(timeWindow?: ITimeWindow): Promise<IMatchLineupSlotPlacement[]> {
        const entities = await this.prisma.matchLineupSlot.findMany({
            select: {
                setupNumber: true,
                characterKey: true,
                teamMember: {
                    select: {
                        teamId: true,
                        team: {
                            select: { matchId: true },
                        },
                    },
                },
            },
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
            include: { character: true },
            where: playerIdentity ? { teamMember: buildMatchTeamMemberWhere(playerIdentity) } : undefined,
        });

        return entities.map((entity) => ({
            characterKey: entity.characterKey,
            character: mapCharacter(entity.character),
        }));
    }

    private buildMatchTimeWindowWhere(timeWindow: ITimeWindow): { createdAt: Prisma.DateTimeFilter<never> } | undefined {
        const filter: Prisma.DateTimeFilter = {};

        if (timeWindow.startAt) {
            filter.gte = timeWindow.startAt;
        }

        if (timeWindow.endAt) {
            filter.lte = timeWindow.endAt;
        }

        return Object.keys(filter).length > 0 ? { createdAt: filter } : undefined;
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

    private mapPlayerIdentity(member: { memberRef: number | null; guestRef: number | null; name: string }): PlayerIdentity {
        if (member.memberRef) return { type: 'Member', id: member.memberRef };
        if (member.guestRef) return { type: 'Guest', id: member.guestRef };
        return { type: 'Name', name: member.name };
    }
}
