// backend/src/services/match/MatchService.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { TeamMember } from '../../types/TeamMember.ts';
import {
    DataNotFoundError,
    DbConnectionError,
    DbForeignKeyConstraintError,
    DbUniqueConstraintError,
    DryRunError,
    InvalidFieldsError,
    UserNotFoundError,
} from '../../errors/AppError.ts';
import { IRoomStateManager } from '../../modules/socket/managers/IRoomStateManager.ts';
import { createLogger } from '../../utils/logger.ts';

const logger = createLogger('ROOM STATE PERSISTENCE SERVICE');

export class MatchService {
    constructor(
        private prisma: PrismaClient,
        private roomStateManager: IRoomStateManager,
    ) {}

    async deleteMatch({ matchId }: { matchId: number }) {
        return await this.prisma.match.delete({
            where: { id: matchId },
        });
    }

    async saveMatch(roomId: string, dryRun = true) {
        const roomState = this.roomStateManager.get(roomId);
        if (!roomState) {
            logger.error('Room state not found');
            throw new DataNotFoundError();
        }
        const roomSetting = roomState.roomSetting;

        console.log(`roomState.teamMembersMap`, roomState.teamMembersMap);
        for (const [teamSlotString, teamMembers] of Object.entries(roomState.teamMembersMap)) {
            console.log(`Object.values(teamMembers).length`, Object.values(teamMembers).length);
            if (Object.values(teamMembers).length !== roomSetting.numberOfTeamSetup) {
                logger.error('Team members are inconsistent with number of team setup', teamSlotString, teamMembers, roomSetting.numberOfTeamSetup);
                throw new InvalidFieldsError();
            }
        }

        const totalZonesCount = Object.values(roomSetting.zoneMetaTable).length;
        const selectedCount = Object.values(roomState.boardImageMap).length;

        if (totalZonesCount !== selectedCount) {
            logger.error('Selected board image count is inconsistent with total zones count', selectedCount, totalZonesCount);
            throw new InvalidFieldsError();
        }

        for (const tacticalCellImageMap of Object.values(roomState.teamTacticalCellImageMap)) {
            const totalCellsCount = roomSetting.numberOfSetupCharacter * roomSetting.numberOfTeamSetup;
            const selectedCount = Object.values(tacticalCellImageMap).length;
            if (selectedCount !== totalCellsCount) {
                logger.error('Selected tactical cell image count is inconsistent with total cells count', selectedCount, totalCellsCount);
                throw new InvalidFieldsError();
            }
        }

        try {
            return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const flowVersion = roomSetting.matchFlow.version;
                // 1. Match: 對局
                const match = await tx.match.create({
                    data: {
                        flowVersion: flowVersion,
                    },
                });

                // 2. MatchTeam 隊伍
                const teams = roomSetting.teams;
                const matchTeams = await Promise.all(
                    teams.map((team) =>
                        tx.matchTeam.create({
                            data: {
                                slot: team.slot,
                                name: team.name,
                                matchId: match.id,
                            },
                        }),
                    ),
                );

                const matchTeamIdMap: Record<number, number> = {};
                matchTeams.forEach((team) => {
                    matchTeamIdMap[team.slot] = team.id;
                });

                // 3. MatchTeamMember: 隊伍成員
                for (const [teamSlotString, teamMembers] of Object.entries(roomState.teamMembersMap)) {
                    const teamSlot = Number(teamSlotString);
                    const matchTeamId = matchTeamIdMap[teamSlot];
                    for (const [memberSlotString, member] of Object.entries(teamMembers)) {
                        const memberSlot = Number(memberSlotString);
                        const resolved = resolveIdentity(member);
                        await tx.matchTeamMember.create({
                            data: {
                                slot: memberSlot,
                                name: resolved.name,
                                teamId: matchTeamId,
                                memberRef: resolved.memberRef,
                                guestRef: resolved.guestRef,
                            },
                        });
                    }
                }

                // 4. MatchMove: Ban/Pick/Utility 移動順序

                const steps = roomSetting.matchFlow.steps;
                const zoneMetaTable = roomSetting.zoneMetaTable;
                const boardImageMap = roomState.boardImageMap;

                const matchMoves = [];
                for (const step of steps) {
                    const matchTeamId = step.teamSlot === null ? null : matchTeamIdMap[step.teamSlot];
                    const zone = zoneMetaTable[step.zoneId];
                    const characterKey = boardImageMap[step.zoneId];

                    const randomContext = roomState.characterRandomContextMap[characterKey] ?? null;
                    const matchMove = await tx.matchMove.create({
                        data: {
                            order: step.index,
                            type: zone.type,
                            source: randomContext ? 'Random' : 'Manual',
                            matchId: match.id,
                            teamId: matchTeamId,
                            characterKey,
                        },
                    });

                    if (randomContext) {
                        await tx.randomMoveContext.create({
                            data: {
                                filters: randomContext.characterFilter,
                                matchMoveId: matchMove.id,
                            },
                        });
                    }

                    matchMoves.push(matchMove);
                }

                // 5. MatchTacticalUsage: 戰術版

                const tacticalVersion = roomSetting.tacticalVersion;
                const teamTacticalCellImageMap = roomState.teamTacticalCellImageMap;
                const numberOfTeamSetup = roomSetting.numberOfTeamSetup;
                const numberOfSetupCharacter = roomSetting.numberOfSetupCharacter;
                for (const [teamSlotString, tacticalCellImageMap] of Object.entries(teamTacticalCellImageMap)) {
                    const teamSlot = Number(teamSlotString);
                    const matchTeamId = matchTeamIdMap[teamSlot];

                    // 找該隊所有隊員
                    const targetMembers = await tx.matchTeamMember.findMany({
                        where: { teamId: matchTeamId },
                        orderBy: { slot: 'asc' },
                    });

                    const usages = Object.entries(tacticalCellImageMap)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([cellIndexString, characterKey]) => {
                            const cellIndex = Number(cellIndexString);

                            const playerIndex = cellIndex % numberOfSetupCharacter; // ← 0~3 決定這格屬於哪位玩家
                            const setupNumber = Math.floor(cellIndex / numberOfSetupCharacter); // ← 第幾個格子（0~3）

                            const targetMember = targetMembers[playerIndex];
                            if (!targetMember) return null;

                            return {
                                modelVersion: tacticalVersion,
                                setupNumber, // 0,1,2,3 對應該隊員的第幾格

                                teamMemberId: targetMember.id,
                                characterKey,
                            };
                        })
                        .filter((entry) => entry !== null);

                    await tx.matchTacticalUsage.createMany({ data: usages });
                }

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

type ResolvedIdentity =
    | {
          kind: 'Manual';
          name: string;
          memberRef: null;
          guestRef: null;
      }
    | {
          kind: 'Member';
          name: string;
          memberRef: number;
          guestRef: null;
      }
    | {
          kind: 'Guest';
          name: string;
          memberRef: null;
          guestRef: number;
      };

function resolveIdentity(teamMember: TeamMember): ResolvedIdentity {
    if (teamMember.type === 'Manual') {
        return {
            kind: 'Manual',
            name: teamMember.name,
            memberRef: null,
            guestRef: null,
        };
    }

    // Online user → parse identityKey = "Member:12" or "Guest:5"
    const { identityKey, nickname } = teamMember.user;
    const [type, idStr] = identityKey.split(':');
    const id = Number(idStr);

    if (type === 'Member') {
        return {
            kind: 'Member',
            name: nickname,
            memberRef: id,
            guestRef: null,
        };
    }

    if (type === 'Guest') {
        return {
            kind: 'Guest',
            name: nickname,
            memberRef: null,
            guestRef: id,
        };
    }

    throw new UserNotFoundError();
}
