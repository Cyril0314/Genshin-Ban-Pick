// src/modules/match/infra/MatchRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';

import MatchCreator from '../application/creators/MatchCreator';
import MatchTeamCreator from '../application/creators/MatchTeamCreator';
import MatchTeamMemberCreator from '../application/creators/MatchTeamMemberCreator';
import MatchMoveCreator from '../application/creators/MatchMoveCreator';
import MatchLineupSlotCreator from '../application/creators/MatchLineupSlotCreator';
import { DataNotFoundError, DbConnectionError, DbForeignKeyConstraintError, DbUniqueConstraintError, DryRunError } from '../../../errors/AppError';
import { createLogger } from '../../../utils/logger';
import { mapMatchFromPrisma } from '../domain/mapMatchFromPrisma';

import type { IMatchRepository } from '../domain/IMatchRepository';
import type { IMatchSnapshot } from '../domain/IMatchSnapshot';
import type { IMatch } from '@shared/contracts/match/IMatch';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

const logger = createLogger('match.infra.repository');

export default class MatchRepository implements IMatchRepository {
    constructor(private prisma: PrismaClient) {}

    async findAllMatches(): Promise<IMatch[]> {
        const matchQuery = Prisma.validator<Prisma.MatchFindManyArgs>()({
            include: {
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
            },
        });

        type Entity = Prisma.MatchGetPayload<typeof matchQuery>;

        const entities: Entity[] = await this.prisma.match.findMany(matchQuery);
        const matches = entities.map(mapMatchFromPrisma);
        return matches;
    }

    async create(snapshot: IMatchSnapshot): Promise<IMatch> {
        return this.run(snapshot, false);
    }

    async preview(snapshot: IMatchSnapshot): Promise<IMatch> {
        return this.run(snapshot, true);
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

                await MatchLineupSlotCreator.createMatchLineupSlots(
                    tx,
                    lineupVersion,
                    teamLineupImageMap,
                    numberOfSetupCharacter,
                    matchTeamIdMap,
                );

                const matchQuery = {
                    where: { id: match.id },
                    include: {
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
                    },
                } satisfies Prisma.MatchFindUniqueArgs;

                const allMatchData = await tx.match.findUnique(matchQuery);
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

    async delete(matchId: number) {
        await this.prisma.match.delete({
            where: { id: matchId },
        });
    }

    async findAllMatchTeamMembers(): Promise<TeamMember[]> {
        const rows = await this.prisma.matchTeamMember.findMany({
            select: {
                name: true,
                memberRef: true,
                guestRef: true,
                member: { select: { nickname: true } },
                guest: { select: { nickname: true } },
            },
        });

        return rows.map((row) => {
            if (row.memberRef && row.member) {
                return { type: 'Member', id: row.memberRef, nickname: row.member.nickname };
            } else if (row.guestRef && row.guest) {
                return { type: 'Guest', id: row.guestRef, nickname: row.guest.nickname };
            } else {
                return { type: 'Name', name: row.name };
            }
        });
    }
}
