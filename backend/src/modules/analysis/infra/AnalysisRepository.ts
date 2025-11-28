// src/modules/analysis/infra/AnalysisRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';
import { restoreFiltersFromJson } from '../../match/domain/restoreFilterFromJson';

import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { IMatchTimeMinimal } from '../types/IMatchTimeMinimal';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchTacticalUsageExpandedRefs } from '../types/IMatchTacticalUsageExpandedRefs';
import type { IMatchTacticalUsageTeamMemberIdentityRefs } from '../types/IMatchTacticalUsageUserPreferenceCore';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';
import type { CharacterFilterKey } from '@shared/contracts/character/value-types';

export default class AnalysisRepository implements IAnalysisRepository {
    constructor(private prisma: PrismaClient) {}

    async findAllMatchMinimalTimestamps(): Promise<IMatchTimeMinimal[]> {
        return await this.prisma.match.findMany({
            select: { id: true, createdAt: true },
        });
    }

    async findAllMatchMoveCoreForWeightCalc(): Promise<IMatchMoveWeightCalcCore[]> {
        type Entity = Prisma.MatchMoveGetPayload<typeof matchMoveWeightCalcCoreQuery>;

        const rows: Entity[] = await this.prisma.matchMove.findMany(matchMoveWeightCalcCoreQuery);

        return rows.map((r) => {
            let randomMoveContext: {
                id: number;
                filters: Record<CharacterFilterKey, string[]>;
                matchMoveId: number;
            } | null;
            if (r.randomMoveContext) {
                randomMoveContext = {
                    id: r.randomMoveContext.id,
                    filters: restoreFiltersFromJson(r.randomMoveContext.filters),
                    matchMoveId: r.randomMoveContext.matchMoveId,
                }
            } else {
                randomMoveContext = null
            }

            return {
                characterKey: r.characterKey,
                type: r.type as MoveType,
                source: r.source as MoveSource,
                matchId: r.matchId,
                characterReleaseDate: r.character.releaseDate,
                randomMoveContext: randomMoveContext,
            };
        });
    }

    async findAllMatchTacticalUsageIdentities(): Promise<IMatchTacticalUsageTeamMemberIdentityRefs[]> {
        type Entity = Prisma.MatchTacticalUsageGetPayload<typeof matchTacticalUsageTeamMemberIdentityRefsQuery>;

        const entities: Entity[] = await this.prisma.matchTacticalUsage.findMany(matchTacticalUsageTeamMemberIdentityRefsQuery);

        return entities.map((r) => ({
            teamId: r.teamMember.teamId,
            setupNumber: r.setupNumber,
            characterKey: r.characterKey,
            teamMemberName: r.teamMember.name,
            memberNickname: r.teamMember.member?.nickname ?? null,
            guestNickname: r.teamMember.guest?.nickname ?? null,
        }));
    }

    async findAllMatchTacticalUsageForAnalysis(): Promise<IMatchTacticalUsageExpandedRefs[]> {
        type Entity = Prisma.MatchTacticalUsageGetPayload<typeof matchTacticalUsageExpandedRefsQuery>;

        const entities: Entity[] = await this.prisma.matchTacticalUsage.findMany(matchTacticalUsageExpandedRefsQuery);

        return entities.map((r) => ({
            matchId: r.teamMember.team.matchId,
            teamId: r.teamMember.teamId,
            setupNumber: r.setupNumber,
            characterKey: r.characterKey,
        }));
    }
}

const matchMoveWeightCalcCoreQuery = Prisma.validator<Prisma.MatchMoveFindManyArgs>()({
    select: {
        type: true,
        source: true,
        matchId: true,
        characterKey: true,
        character: { select: { releaseDate: true } },
        randomMoveContext: true,
    },
});

const matchTacticalUsageTeamMemberIdentityRefsQuery = Prisma.validator<Prisma.MatchTacticalUsageFindManyArgs>()({
    include: {
        teamMember: {
            include: {
                member: true,
                guest: true,
            },
        },
    },
});

const matchTacticalUsageExpandedRefsQuery = Prisma.validator<Prisma.MatchTacticalUsageFindManyArgs>()({
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
