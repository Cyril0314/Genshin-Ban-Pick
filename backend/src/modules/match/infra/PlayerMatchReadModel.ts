// src/modules/match/infra/PlayerMatchReadModel.ts

import { PrismaClient } from '@prisma/client';

import { buildMatchTeamMemberWhere } from './buildMatchTeamMemberWhere';

import type { IPlayerMatchReadModel } from '../domain/IPlayerMatchReadModel';
import type { IPlayerMatchPlacement } from '../types/IPlayerMatchPlacement';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export default class PlayerMatchReadModel implements IPlayerMatchReadModel {
    constructor(private prisma: PrismaClient) {}

    async findPlayerMatchPlacements(playerIdentity: PlayerIdentity): Promise<IPlayerMatchPlacement[]> {
        const entities = await this.prisma.matchLineupSlot.findMany({
            where: { teamMember: buildMatchTeamMemberWhere(playerIdentity) },
            select: {
                characterKey: true,
                teamMember: {
                    select: {
                        team: { select: { matchId: true, match: { select: { createdAt: true } } } },
                    },
                },
            },
        });

        return entities.map((entity) => ({
            matchId: entity.teamMember.team.matchId,
            createdAt: entity.teamMember.team.match.createdAt,
            characterKey: entity.characterKey,
        }));
    }
}
