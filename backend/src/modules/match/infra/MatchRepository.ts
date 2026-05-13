// src/modules/match/infra/MatchRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';

import MatchCreator from '../application/creators/MatchCreator';
import MatchTeamCreator from '../application/creators/MatchTeamCreator';
import MatchTeamMemberCreator from '../application/creators/MatchTeamMemberCreator';
import MatchMoveCreator from '../application/creators/MatchMoveCreator';
import MatchTacticalUsageCreator from '../application/creators/MatchTacticalUsageCreator';
import { DataNotFoundError, DbConnectionError, DbForeignKeyConstraintError, DbUniqueConstraintError, DryRunError } from '../../../errors/AppError';
import { createLogger } from '../../../utils/logger';
import { mapMatchFromPrisma } from '../domain/mapMatchFromPrisma';

import type { IMatchRepository } from '../domain/IMatchRepository';
import type { IMatchSnapshot } from '../domain/IMatchSnapshot';
import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IPlayerProfile } from '@shared/contracts/player/IPlayerProfile';
import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';

const logger = createLogger('MATCH:Repository');

export default class MatchRepository implements IMatchRepository {
    constructor(private prisma: PrismaClient) {}

    async findAllMatches(): Promise<IMatch[]> {
        const matchQuery = Prisma.validator<Prisma.MatchFindManyArgs>()({
            include: {
                teams: {
                    include: {
                        teamMembers: {
                            include: {
                                tacticalUsages: {
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

    async create(snapshot: IMatchSnapshot, dryRun: boolean): Promise<IMatch> {
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

                // 5. MatchTacticalUsage: 戰術版

                const tacticalVersion = roomSetting.tacticalVersion;
                const teamTacticalCellImageMap = snapshot.teamTacticalCellImageMap;
                const numberOfTeamSetup = roomSetting.numberOfTeamSetup;
                const numberOfSetupCharacter = roomSetting.numberOfSetupCharacter;

                await MatchTacticalUsageCreator.createMatchTacticalUsages(
                    tx,
                    tacticalVersion,
                    teamTacticalCellImageMap,
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
                                        tacticalUsages: {
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

    async findAllMatchTeamMemberUniqueIdentities(): Promise<IPlayerProfile[]> {
        const teamMembers = await this.prisma.matchTeamMember.findMany({
            select: {
                id: true,
                name: true,
                memberRef: true,
                guestRef: true,
                member: {
                    select: {
                        id: true,
                        nickname: true,
                    },
                },
                guest: {
                    select: {
                        id: true,
                        nickname: true,
                    },
                },
            },
        });

        const profileMap = new Map<string, IPlayerProfile>();

        for (const teamMember of teamMembers) {
            if (teamMember.memberRef && teamMember.member) {
                const key = `Member:${teamMember.memberRef}`;
                if (!profileMap.has(key)) {
                    profileMap.set(key, {
                        identity: { type: 'Member', id: teamMember.memberRef },
                        displayName: teamMember.member.nickname,
                    });
                }
                continue;
            }

            if (teamMember.guestRef && teamMember.guest) {
                const key = `Guest:${teamMember.guestRef}`;
                if (!profileMap.has(key)) {
                    profileMap.set(key, {
                        identity: { type: 'Guest', id: teamMember.guestRef },
                        displayName: teamMember.guest.nickname,
                    });
                }
                continue;
            }

            // name-only
            if (teamMember.name) {
                const key = `Name:${teamMember.name}`;
                if (!profileMap.has(key)) {
                    profileMap.set(key, {
                        identity: { type: 'Name', name: teamMember.name },
                        displayName: teamMember.name,
                    });
                }
            }
        }

        const identityOrder: Record<PlayerIdentity['type'], number> = {
            Member: 0,
            Guest: 1,
            Name: 2,
        };

        return Array.from(profileMap.values()).sort((a, b) => {
            const typeDiff = identityOrder[a.identity.type] - identityOrder[b.identity.type];
            if (typeDiff !== 0) return typeDiff;

            return a.displayName.localeCompare(b.displayName, 'zh-Hant');
        });
    }
}
