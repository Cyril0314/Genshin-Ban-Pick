// backend/src/modules/match/application/creators/MatchTacticalUsageCreator.ts

import { Prisma } from '@prisma/client';
import { TeamTacticalCellImageMap } from '@shared/contracts/tactical/TeamTacticalCellImageMap';

export default class MatchTacticalUsageCreator {
    static async createMatchTacticalUsages(
        tx: Prisma.TransactionClient,
        tacticalVersion: number,
        teamTacticalCellImageMap: TeamTacticalCellImageMap,
        numberOfSetupCharacter: number,
        matchTeamIdMap: Record<number, number>,
    ) {
        const matchTacticalUsages = [];
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

            const usuages = await tx.matchTacticalUsage.createMany({ data: usages });

            matchTacticalUsages.push(usuages);
        }

        return matchTacticalUsages;
    }
}
