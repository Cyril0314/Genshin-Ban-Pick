// backend/src/modules/analyses/application/synergy/SynergyService.ts

import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client/extension';
import { IRawTacticalUsage } from './types/IRawTacticalUsage.ts';
import { SynergyMode } from './types/SynergyMode.ts';
import { ISynergyMatrix } from './types/ISynergyMatrix.ts';

export class SynergyService {
    constructor(private prisma: PrismaClient) {}

    async getRawTacticalUsages(): Promise<IRawTacticalUsage[]> {
        type MatchTacticalUsage = Prisma.MatchTacticalUsageGetPayload<{
            select: {
                setupNumber: true;
                characterKey: true;
                teamMember: {
                    select: {
                        teamId: true;
                        team: {
                            select: {
                                matchId: true;
                            };
                        };
                    };
                };
            };
        }>;

        const rows: MatchTacticalUsage[] = await this.prisma.matchTacticalUsage.findMany({
            select: {
                setupNumber: true,
                characterKey: true,
                teamMember: {
                    select: {
                        teamId: true,
                        team: {
                            select: { matchId: true },
                        },
                    },
                },
            },
        });

        return rows.map((r) => ({
            matchId: r.teamMember.team.matchId,
            teamId: r.teamMember.teamId,
            setupNumber: r.setupNumber,
            characterKey: r.characterKey,
        }));
    }

    buildCooccurrenceGroups(usages: IRawTacticalUsage[], mode: SynergyMode): Record<string, string[]> {
        const groups: Record<string, string[]> = {};

        for (const u of usages) {
            const key = this.buildCooccurrenceGroupKey(u, mode);
            if (!groups[key]) groups[key] = [];
            groups[key].push(u.characterKey);
        }

        return groups;
    }

    buildSynergyMatrix(groups: Record<string, string[]>): ISynergyMatrix {
        const synergy: ISynergyMatrix = {};

        for (const characters of Object.values(groups)) {
            // 去重，避免同一 group 同一角色被算兩次
            const uniq = [...new Set(characters)];

            for (let i = 0; i < uniq.length; i++) {
                for (let j = i + 1; j < uniq.length; j++) {
                    const a = uniq[i];
                    const b = uniq[j];

                    synergy[a] ??= {};
                    synergy[b] ??= {};

                    synergy[a][b] = (synergy[a][b] || 0) + 1;
                    synergy[b][a] = (synergy[b][a] || 0) + 1;
                }
            }
        }

        return synergy;
    }

    private buildCooccurrenceGroupKey(rawTacticalUsage: IRawTacticalUsage, mode: SynergyMode): string {
        switch (mode) {
            case 'match':
                // 一場比賽當作一個 group
                return `${rawTacticalUsage.matchId}`;
            case 'team':
                // 同一個隊伍（整體）當作一個 group
                return `${rawTacticalUsage.teamId}`;
            case 'setup':
                // 一場比賽 + 一隊 + 一個編成（setup）當作一個 group
                return `${rawTacticalUsage.matchId}:${rawTacticalUsage.teamId}:${rawTacticalUsage.setupNumber}`;
        }
    }
}
