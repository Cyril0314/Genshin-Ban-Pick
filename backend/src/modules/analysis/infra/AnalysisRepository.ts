// src/modules/analysis/infra/AnalysisRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';
import { restoreFiltersFromJson } from '../../match/domain/restoreFilterFromJson';
import { mapCharacter } from '../../character';

import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { IMatchTimeMinimal } from '../types/IMatchTimeMinimal';
import type { IMatchMoveWeightCalcCore } from '../types/IMatchMoveWeightCalcCore';
import type { IMatchTacticalUsageExpandedRefs } from '../types/IMatchTacticalUsageExpandedRefs';
import type { IMatchTacticalUsageTeamMemberIdentityRefs } from '../types/IMatchTacticalUsageUserPreferenceCore';
import type { IMatchTacticalUsageWithCharacter } from '../types/IMatchTacticalUsageWithCharacter';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export default class AnalysisRepository implements IAnalysisRepository {
    constructor(private prisma: PrismaClient) {}

    async findAllMatchMinimalTimestamps(): Promise<IMatchTimeMinimal[]> {
        return await this.prisma.match.findMany({
            select: { id: true, createdAt: true },
        });
    }

    async findAllMatchMoveCoreForWeightCalc(): Promise<IMatchMoveWeightCalcCore[]> {
        type Entity = Prisma.MatchMoveGetPayload<typeof matchMoveWeightCalcCoreQuery>;

        const entities: Entity[] = await this.prisma.matchMove.findMany(matchMoveWeightCalcCoreQuery);

        return entities.map((entity) => {
            let randomMoveContext: {
                id: number;
                filters: Record<CharacterFilterKey, string[]>;
                matchMoveId: number;
            } | null;
            if (entity.randomMoveContext) {
                randomMoveContext = {
                    id: entity.randomMoveContext.id,
                    filters: restoreFiltersFromJson(entity.randomMoveContext.filters),
                    matchMoveId: entity.randomMoveContext.matchMoveId,
                };
            } else {
                randomMoveContext = null;
            }

            return {
                characterKey: entity.characterKey,
                type: entity.type as MoveType,
                source: entity.source as MoveSource,
                matchId: entity.matchId,
                characterReleaseDate: entity.character.releaseDate,
                randomMoveContext: randomMoveContext,
            };
        });
    }

    async findAllMatchTacticalUsageIdentities(): Promise<IMatchTacticalUsageTeamMemberIdentityRefs[]> {
        type Entity = Prisma.MatchTacticalUsageGetPayload<typeof matchTacticalUsageTeamMemberIdentityRefsQuery>;

        const entities: Entity[] = await this.prisma.matchTacticalUsage.findMany(matchTacticalUsageTeamMemberIdentityRefsQuery);

        return entities.map((entity) => ({
            teamId: entity.teamMember.teamId,
            setupNumber: entity.setupNumber,
            characterKey: entity.characterKey,
            teamMemberName: entity.teamMember.name,
            memberNickname: entity.teamMember.member?.nickname ?? null,
            guestNickname: entity.teamMember.guest?.nickname ?? null,
        }));
    }

    async findAllMatchTacticalUsageForAnalysis(): Promise<IMatchTacticalUsageExpandedRefs[]> {
        type Entity = Prisma.MatchTacticalUsageGetPayload<typeof matchTacticalUsageExpandedRefsQuery>;

        const entities: Entity[] = await this.prisma.matchTacticalUsage.findMany(matchTacticalUsageExpandedRefsQuery);

        return entities.map((entity) => ({
            matchId: entity.teamMember.team.matchId,
            teamId: entity.teamMember.teamId,
            setupNumber: entity.setupNumber,
            characterKey: entity.characterKey,
        }));
    }

    async findAllMatchTacticalUsageWithCharacter(): Promise<IMatchTacticalUsageWithCharacter[]> {
        const entities = await this.prisma.matchTacticalUsage.findMany({
            include: {
                character: true,
            },
        });

        return entities.map((entity) => ({
            characterKey: entity.characterKey,
            character: mapCharacter(entity.character),
        }));
    }

    async findMatchTacticalUsageWithCharacterByIdentity(identity: MatchTeamMemberUniqueIdentity): Promise<IMatchTacticalUsageWithCharacter[]> {
        let whereInput: Parameters<typeof this.prisma.matchTacticalUsage.findMany>[0]['where'];
        switch (identity.type) {
            case 'Member':
                whereInput = {
                    teamMember: {
                        memberRef: identity.id,
                    },
                };
                break;
            case 'Guest':
                whereInput = {
                    teamMember: {
                        guestRef: identity.id,
                    },
                };
                break;
            case 'Name':
                whereInput = {
                    teamMember: {
                        name: identity.name,
                    },
                };
                break;
        }

        const entities = await this.prisma.matchTacticalUsage.findMany({
            where: whereInput,
            include: {
                character: true,
            },
        });

        return entities.map((entity) => ({
            characterKey: entity.characterKey,
            character: mapCharacter(entity.character),
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
