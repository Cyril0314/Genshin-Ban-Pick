// src/modules/match/infra/MatchRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';

import { buildMatchTeamMemberWhere } from './buildMatchTeamMemberWhere';
import { mapMatchFromPrisma, mapMoveFromPrisma } from './mapMatchFromPrisma';
import { mapPlayerIdentity } from '../domain/mapPlayerIdentity';
import { mapTeamMember } from '../domain/mapTeamMember';
import { DataNotFoundError, DbConnectionError, DbForeignKeyConstraintError, DbUniqueConstraintError, DryRunError } from '../../../errors/AppError';
import { createLogger } from '../../../utils/logger';
import MatchCreator from '../application/creators/MatchCreator';
import MatchLineupSlotCreator from '../application/creators/MatchLineupSlotCreator';
import MatchMoveCreator from '../application/creators/MatchMoveCreator';
import MatchTeamCreator from '../application/creators/MatchTeamCreator';
import MatchTeamMemberCreator from '../application/creators/MatchTeamMemberCreator';

import type { IMatchRepository } from '../domain/IMatchRepository';
import type { IMatchSnapshot } from '../domain/IMatchSnapshot';
import type { IMatchLineupSlotLight } from '../types/IMatchLineupSlotLight';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchMove } from '@shared/contracts/match/IMatchMove';
import type { IMatchTimestamp } from '@shared/contracts/match/IMatchTimestamp';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

const logger = createLogger('match.infra.repository');

export default class MatchRepository implements IMatchRepository {
    constructor(private prisma: PrismaClient) {}

    async findAll(): Promise<IMatch[]> {
        const entities = await this.prisma.match.findMany({ include: matchInclude });
        const matches = entities.map(mapMatchFromPrisma);
        return matches;
    }

    async findById(matchId: number): Promise<IMatch | undefined> {
        const entity = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: matchInclude,
        });
        return entity ? mapMatchFromPrisma(entity) : undefined;
    }

    async create(snapshot: IMatchSnapshot): Promise<IMatch> {
        return this.run(snapshot, false);
    }

    async preview(snapshot: IMatchSnapshot): Promise<IMatch> {
        return this.run(snapshot, true);
    }

    async delete(matchId: number) {
        await this.prisma.match.delete({
            where: { id: matchId },
        });
    }

    async findMatchTeamMembers(playerIdentity?: PlayerIdentity): Promise<TeamMember[]> {
        // 無 playerIdentity → 全部 team members；有 → target 同隊的成員
        const rows = await this.prisma.matchTeamMember.findMany({
            where: playerIdentity ? { team: { teamMembers: { some: buildMatchTeamMemberWhere(playerIdentity) } } } : undefined,
            select: {
                name: true,
                memberRef: true,
                guestRef: true,
                member: { select: { nickname: true } },
                guest: { select: { nickname: true } },
            },
        });

        return rows.map(mapTeamMember);
    }

    async findMatchTimestamps(timeWindow?: ITimeWindow): Promise<IMatchTimestamp[]> {
        return this.prisma.match.findMany({
            where: timeWindow ? this.buildTimeWindowWhere(timeWindow) : undefined,
            select: { id: true, createdAt: true },
        });
    }

    async findMatchMoves(timeWindow?: ITimeWindow): Promise<IMatchMove[]> {
        const moves = await this.prisma.matchMove.findMany({
            where: timeWindow ? { match: this.buildTimeWindowWhere(timeWindow) } : undefined,
            include: { character: true, randomMoveContext: true },
        });
        return moves.map(mapMoveFromPrisma);
    }

    async findMatchLineupSlotLights(): Promise<IMatchLineupSlotLight[]> {
        // 全站 lineup slot 的輕量讀取：只取擁有者身分 + 角色（無 character/nickname join）
        const rows = await this.prisma.matchLineupSlot.findMany({
            select: {
                characterKey: true,
                teamMember: { select: { memberRef: true, guestRef: true, name: true } },
            },
        });

        return rows.map((row) => ({
            teamMember: mapPlayerIdentity(row.teamMember),
            characterKey: row.characterKey,
        }));
    }

    private async run(snapshot: IMatchSnapshot, dryRun: boolean): Promise<IMatch> {
        const { roomSetting } = snapshot;
        try {
            const match = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const flowVersion = roomSetting.matchFlow.version;
                // 1. Match: 對局

                const match = await MatchCreator.createMatch(tx, flowVersion);

                // 2. MatchTeam 隊伍

                const teams = roomSetting.teams;
                const matchTeams = await MatchTeamCreator.createMatchTeams(tx, match.id, teams);

                const matchTeamIdMap: Record<number, number> = {};
                matchTeams.forEach((team) => {
                    matchTeamIdMap[team.slot] = team.id;
                });

                // 3. MatchTeamMember: 隊伍成員

                const teamMembersMap = snapshot.teamMembersMap;

                await MatchTeamMemberCreator.createMatchTeamMembers(tx, teamMembersMap, matchTeamIdMap);

                // 4. MatchMove: Ban/Pick/Utility 移動順序

                const steps = roomSetting.matchFlow.steps;
                const zoneMetaTable = roomSetting.zoneMetaTable;
                const boardImageMap = snapshot.boardImageMap;
                const characterRandomContextMap = snapshot.characterRandomContextMap;

                await MatchMoveCreator.createMatchMoves(tx, match.id, steps, zoneMetaTable, boardImageMap, characterRandomContextMap, matchTeamIdMap);

                // 5. MatchLineupSlot: 出場表

                const lineupVersion = roomSetting.lineupVersion;
                const teamLineupImageMap = snapshot.teamLineupImageMap;
                const numberOfTeamSetup = roomSetting.numberOfTeamSetup;
                const numberOfSetupCharacter = roomSetting.numberOfSetupCharacter;

                await MatchLineupSlotCreator.createMatchLineupSlots(tx, lineupVersion, teamLineupImageMap, numberOfSetupCharacter, matchTeamIdMap);

                const allMatchData = await tx.match.findUnique({
                    where: { id: match.id },
                    include: matchInclude,
                });
                if (!allMatchData) throw new DataNotFoundError();
                const aggregate = mapMatchFromPrisma(allMatchData);
                if (dryRun) throw new DryRunError(aggregate);
                return aggregate;
            });
            return match;
        } catch (err: any) {
            if (err instanceof DryRunError) {
                logger.warn('Block dry run data', err.data);
                return err.data;
            }
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    throw new DbUniqueConstraintError(err);
                }

                if (err.code === 'P2003') {
                    throw new DbForeignKeyConstraintError(err);
                }
            }

            throw new DbConnectionError(err);
        }
    }

    private buildTimeWindowWhere(timeWindow: ITimeWindow): { createdAt: Prisma.DateTimeFilter<never> } | undefined {
        const filter: Prisma.DateTimeFilter = {};
        if (timeWindow.startAt) filter.gte = timeWindow.startAt;
        if (timeWindow.endAt) filter.lte = timeWindow.endAt;
        return Object.keys(filter).length > 0 ? { createdAt: filter } : undefined;
    }
}

const matchInclude = Prisma.validator<Prisma.MatchInclude>()({
    teams: {
        include: {
            teamMembers: {
                include: {
                    lineupSlots: {
                        include: {
                            character: true,
                        },
                    },
                    member: true,
                    guest: true,
                },
            },
        },
    },
    moves: {
        include: {
            randomMoveContext: true,
            character: true,
        },
    },
});
