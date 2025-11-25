// backend/src/modules/match/application/match.service.ts

import { Prisma, PrismaClient } from '@prisma/client';

import {
    DataNotFoundError,
    DbConnectionError,
    DbForeignKeyConstraintError,
    DbUniqueConstraintError,
    DryRunError,
} from '../../../errors/AppError.ts';
import { createLogger } from '../../../utils/logger.ts';
import { validateSnapshot } from '../domain/validateSnapshot.ts';
import { MatchTeamCreator } from './MatchTeamCreator.ts';
import { MatchCreator } from './MatchCreator.ts';
import { MatchTeamMemberCreator } from './MatchTeamMemberCreator.ts';
import { MatchMoveCreator } from './MatchMoveCreator.ts';
import { MatchTacticalUsageCreator } from './MatchTacticalUsageCreator.ts';
import { IMatchSnapshotRepository } from '../domain/IMatchSnapshotRepository.ts';

const logger = createLogger('MATCH');

export default class MatchService {
    constructor(
        private prisma: PrismaClient,
        private matchSnapshotRepository: IMatchSnapshotRepository,
    ) {} 

    async saveMatch(roomId: string, dryRun = true) {
        const snapshot = this.matchSnapshotRepository.getSnapshot(roomId);
        if (!snapshot) {
            logger.error('Room state not found');
            throw new DataNotFoundError();
        }
        validateSnapshot(snapshot)
        const roomSetting = snapshot.roomSetting;
        try {
            return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const flowVersion = roomSetting.matchFlow.version;
                // 1. Match: 對局
                const match = await MatchCreator.createMatch(tx, flowVersion)

                // 2. MatchTeam 隊伍
                const teams = roomSetting.teams;
                const matchTeams = await MatchTeamCreator.createMatchTeams(tx, match.id, teams)

                const matchTeamIdMap: Record<number, number> = {};
                matchTeams.forEach((team) => {
                    matchTeamIdMap[team.slot] = team.id;
                });

                // 3. MatchTeamMember: 隊伍成員
                const teamMembersMap = snapshot.teamMembersMap

                await MatchTeamMemberCreator.createMatchTeamMembers(tx, teamMembersMap, matchTeamIdMap);

                // 4. MatchMove: Ban/Pick/Utility 移動順序

                const steps = roomSetting.matchFlow.steps;
                const zoneMetaTable = roomSetting.zoneMetaTable;
                const boardImageMap = snapshot.boardImageMap;
                const characterRandomContextMap = snapshot.characterRandomContextMap;

                await MatchMoveCreator.createMatchMoves(tx, match.id, steps, zoneMetaTable, boardImageMap, characterRandomContextMap, matchTeamIdMap)

                // 5. MatchTacticalUsage: 戰術版

                const tacticalVersion = roomSetting.tacticalVersion;
                const teamTacticalCellImageMap = snapshot.teamTacticalCellImageMap;
                const numberOfTeamSetup = roomSetting.numberOfTeamSetup;
                const numberOfSetupCharacter = roomSetting.numberOfSetupCharacter;
                
                await MatchTacticalUsageCreator.createMatchTacticalUsages(tx, tacticalVersion, teamTacticalCellImageMap, numberOfSetupCharacter, matchTeamIdMap)

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

                if (dryRun) throw new DryRunError(allMatchData);
                return allMatchData;
            });
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
}