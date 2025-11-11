// backend/src/services/room/RoomStatePersistenceService.ts
import { Prisma, PrismaClient } from '@prisma/client';

import { RoomStateManager } from '../../socket/managers/RoomStateManager.ts';
import { IRoomSetting } from '../../types/IRoomSetting.ts';
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
import { createLogger } from '../../utils/logger.ts';

const logger = createLogger('ROOM STATE PERSISTENCE SERVICE');

export class RoomStatePersistenceService {
    constructor(
        private prisma: PrismaClient,
        private roomStateManager: RoomStateManager,
    ) {}

    async delete({ matchId }: { matchId: number }) {
        return await this.prisma.match.delete({
            where: { id: matchId },
        });
    }

    async save({ roomId, roomSetting }: { roomId: string; roomSetting: IRoomSetting }, dryRun = true) {
        const roomState = this.roomStateManager.get(roomId);
        if (!roomState) {
            logger.error('Room state not found');
            throw new DataNotFoundError();
        }

        for (const [teamSlotString, teamMembers] of Object.entries(roomState.teamMembersMap)) {
            // fix member slot should add
            if (teamMembers.length !== roomSetting.numberOfTeamSetup) {
                logger.error('Team members are inconsistent with numberOfTeamSetup', teamSlotString, teamMembers, roomSetting.numberOfTeamSetup);
                throw new InvalidFieldsError();
            }
        }

        const totalZonesCount = Object.values(roomSetting.zoneMetaTable).length;
        const selectedCount = Object.values(roomState.boardImageMap).length;

        if (totalZonesCount !== selectedCount) {
            logger.error('Selected board image count is inconsistent with total zones count', selectedCount, totalZonesCount);
            throw new InvalidFieldsError();
        }

        for (const tacticalCellImageMap of Object.values(roomState.teamTacticalBoardMap)) {
            const totalCellsCount = roomSetting.numberOfSetupCharacter * roomSetting.numberOfTeamSetup;
            const selectedCount = Object.values(tacticalCellImageMap).length;
            if (selectedCount !== totalCellsCount) {
                logger.error('Selected tactical cell image count is inconsistent with total cells count', selectedCount, totalCellsCount);
                throw new InvalidFieldsError();
            }
        }

        try {
            return await this.prisma.$transaction(async (tx: any) => {
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
                                teamSlot: team.slot,
                                name: team.name,
                                matchId: match.id,
                            },
                        }),
                    ),
                );

                const matchTeamIdMap: Record<number, number> = {};
                matchTeams.forEach((team) => {
                    matchTeamIdMap[team.teamSlot] = team.id;
                });

                // 3. MatchTeamMember: 隊伍成員
                for (const [teamSlotString, teamMembers] of Object.entries(roomState.teamMembersMap)) {
                    const teamSlot = Number(teamSlotString);
                    const matchTeamId = matchTeamIdMap[teamSlot];
                    for (const member of Object.values(teamMembers)) {
                        const resolved = resolveIdentity(member);
                        await tx.matchTeamMember.createMany({
                            data: {
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
                const teamTacticalBoardMap = roomState.teamTacticalBoardMap;
                const numberOfTeamSetup = roomSetting.numberOfTeamSetup;
                const numberOfSetupCharacter = roomSetting.numberOfSetupCharacter;
                for (const [teamSlotString, tacticalCellImageMap] of Object.entries(teamTacticalBoardMap)) {
                    const teamSlot = Number(teamSlotString);
                    const matchTeamId = matchTeamIdMap[teamSlot];

                    // 找該隊所有隊員
                    const targetMembers = await tx.matchTeamMember.findMany({
                        where: { teamId: matchTeamId },
                        orderBy: { id: 'asc' }, // 加入隊員順序與 board index 一致 // fix member slot
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

                if (dryRun) throw new DryRunError();
                return match.id;
            });
        } catch (err: any) {
            if (err instanceof DryRunError) {
                logger.warn('Block dry run', err);
                return null;
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

function resolveIdentity(teamMember: TeamMember) {
    if (teamMember.type === 'Manual') {
        return {
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
            name: nickname,
            memberRef: id,
            guestRef: null,
        };
    }

    if (type === 'Guest') {
        return {
            name: nickname,
            memberRef: null,
            guestRef: id,
        };
    }

    throw new UserNotFoundError();
}
