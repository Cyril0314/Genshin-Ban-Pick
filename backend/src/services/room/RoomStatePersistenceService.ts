// backend/src/services/room/RoomStatePersistenceService.ts

import { PrismaClient } from '@prisma/client/extension';
import { RoomStateManager } from '../../socket/managers/RoomStateManager.ts';
import { IRoomSetting } from '../../types/IRoomSetting.ts';
import { TeamMember } from '../../types/TeamMember.ts';

export class RoomStatePersistenceService {
    constructor(
        private prisma: PrismaClient,
        private roomStateManager: RoomStateManager,
    ) {}

    async save(roomId: string, roomSetting: IRoomSetting, dryRun = true) {
        try {
            return await this.prisma.$transaction(async (tx: any) => {
                const roomState = this.roomStateManager.get(roomId);
                if (!roomState) {
                    throw new Error(`[RoomStatePersistenceService] No state for roomId=${roomId}`);
                }

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
                                matchId: match.id,
                                teamSlot: team.slot,
                                name: team.name,
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

                    await tx.matchTeamMember.createMany({
                        data: teamMembers.map((teamMember) => {
                            const resolved = resolveIdentity(teamMember);
                            return {
                                teamId: matchTeamId,
                                name: resolved.name,
                                memberRef: resolved.memberRef,
                                guestRef: resolved.guestRef,
                            };
                        }),
                    });
                }

                // 4. MatchMove: Ban/Pick/Utility 移動順序

                const steps = roomSetting.matchFlow.steps;
                const zoneMetaTable = roomSetting.zoneMetaTable;
                const boardImageMap = roomState.boardImageMap;
                const matchMoves = await Promise.all(
                    steps.map((step) => {
                        const matchTeamId = matchTeamIdMap[step.teamSlot];
                        const zone = zoneMetaTable[step.zoneId];
                        const characterKey = boardImageMap[step.zoneId];
                        return tx.matchMove.create({
                            data: {
                                matchId: match.id,
                                teamId: matchTeamId,
                                characterKey: characterKey,
                                order: step.index,
                                type: zone.type,
                            },
                        });
                    }),
                );

                // 5. MatchTacticalUsage: 戰術版

                const tacticalVersion = roomSetting.tacticalVersion
                const teamTacticalBoardMap = roomState.teamTacticalBoardMap;
                const numberOfTeamSetup = roomSetting.numberOfTeamSetup;
                const numberOfSetupCharacter = roomSetting.numberOfSetupCharacter;
                for (const [teamSlotString, tacticalCellImageMap] of Object.entries(teamTacticalBoardMap)) {
                    const teamSlot = Number(teamSlotString);
                    const matchTeamId = matchTeamIdMap[teamSlot];

                    // 找該隊所有隊員
                    const targetMembers = await tx.matchTeamMember.findMany({
                        where: { teamId: matchTeamId },
                        orderBy: { id: 'asc' }, // 加入隊員順序與 board index 一致
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
                                teamMemberId: targetMember.id,
                                characterKey,
                                setupNumber, // 0,1,2,3 對應該隊員的第幾格
                            };
                        })
                        .filter((entry) => entry !== null);

                    await tx.matchTacticalUsage.createMany({ data: usages });
                }


                const matchMembers = await tx.matchTeamMember.findMany();
                const matchTacticalUsages = await tx.matchTacticalUsage.findMany();
                console.log(`match`, match)
                console.log(`matchTeams`, matchTeams)
                console.log(`matchMembers`, matchMembers)
                console.log(`matchMoves`, matchMoves)
                console.log(`matchTacticalUsages`, matchTacticalUsages)
                if (dryRun) throw new Error('DRY_RUN');
                return match.id;
            });
        } catch (err: any) {
            if (err.message === 'DRY_RUN') {
                    console.log(`DRY_RUN Success`)
                    return null; 
                }
            throw err; // 真錯誤
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

    throw new Error(`Unknown identityKey type: ${identityKey}`);
}
