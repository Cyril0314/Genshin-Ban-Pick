// backend/src/modules/match/application/creators/MatchLineupSlotCreator.ts

import { Prisma } from '@prisma/client';

import type { TeamLineupImageMap } from '@shared/contracts/lineup/TeamLineupImageMap';

export default class MatchLineupSlotCreator {
    static async createMatchLineupSlots(
        tx: Prisma.TransactionClient,
        lineupVersion: number,
        teamLineupImageMap: TeamLineupImageMap,
        numberOfSetupCharacter: number,
        matchTeamIdMap: Record<number, number>,
    ) {
        const matchLineupSlots = [];
        for (const [teamSlotString, lineupImageMap] of Object.entries(teamLineupImageMap)) {
            const teamSlot = Number(teamSlotString);
            const matchTeamId = matchTeamIdMap[teamSlot];

            // 找該隊所有隊員
            const targetMembers = await tx.matchTeamMember.findMany({
                where: { teamId: matchTeamId },
                orderBy: { slot: 'asc' },
            });

            const slotsData = Object.entries(lineupImageMap)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([cellIndexString, characterKey]) => {
                    const cellIndex = Number(cellIndexString);

                    const playerIndex = cellIndex % numberOfSetupCharacter; // ← 0~3 決定這格屬於哪位玩家
                    const setupNumber = Math.floor(cellIndex / numberOfSetupCharacter); // ← 第幾個格子（0~3）

                    const targetMember = targetMembers[playerIndex];
                    if (!targetMember) return undefined;

                    return {
                        modelVersion: lineupVersion,
                        setupNumber, // 第幾個 setup（0~3）對應該玩家的第幾格
                        teamMemberId: targetMember.id,
                        characterKey,
                    };
                })
                .filter((entry) => entry !== undefined);

            const slots = await tx.matchLineupSlot.createMany({ data: slotsData });

            matchLineupSlots.push(slots);
        }

        return matchLineupSlots;
    }
}
