// src/modules/player/application/player.service.ts

import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import type { IMatchRepository } from '../../match/domain/IMatchRepository';
import type { IPlayerMatchReadModel } from '../../match/domain/IPlayerMatchReadModel';
import type UserService from '../../user/application/user.service';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IPlayerMatchSummary } from '@shared/contracts/player/IPlayerMatchSummary';
import type { IPlayerCharacterFrequency, IPlayerRecord } from '@shared/contracts/player/IPlayerRecord';
import type { IPlayerTeammate } from '@shared/contracts/player/IPlayerTeammate';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

export default class PlayerService {
    constructor(
        private playerMatchReadModel: IPlayerMatchReadModel,
        private matchRepository: IMatchRepository,
        private userService: UserService,
    ) {}

    async fetchPlayerRecord(playerIdentity: PlayerIdentity, count = 10): Promise<IPlayerRecord> {
        const slots = await this.playerMatchReadModel.findPlayerMatchLineupSlots(playerIdentity);
        const teamMember = slots[0]?.teamMember ?? (await this.resolveTeamMember(playerIdentity));

        const totalSetups = slots.length;

        const characterCounts: Record<string, number> = {};
        for (const row of slots) {
            characterCounts[row.characterKey] = (characterCounts[row.characterKey] ?? 0) + 1;
        }

        const characterFrequency: IPlayerCharacterFrequency[] = Object.entries(characterCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([characterKey, count]) => ({
                characterKey,
                count,
                rate: totalSetups > 0 ? count / totalSetups : 0,
            }));

        return { teamMember, totalSetups, characterFrequency, };
    }

    async fetchPlayerMatches(playerIdentity: PlayerIdentity): Promise<IPlayerMatchSummary[]> {
        const rows = await this.playerMatchReadModel.findPlayerMatchPlacements(playerIdentity);

        // 攤平的 placement rows → 按 match 分組、角色去重
        const byMatch = new Map<number, IPlayerMatchSummary>();
        for (const row of rows) {
            let summary = byMatch.get(row.matchId);
            if (!summary) {
                summary = { matchId: row.matchId, createdAt: row.createdAt, characterKeys: [] };
                byMatch.set(row.matchId, summary);
            }
            if (!summary.characterKeys.includes(row.characterKey)) {
                summary.characterKeys.push(row.characterKey);
            }
        }

        return [...byMatch.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async fetchPlayerTeammates(playerIdentity: PlayerIdentity, count = 5): Promise<IPlayerTeammate[]> {
        const teamMembers = await this.matchRepository.findMatchTeamMembers(playerIdentity);
        const selfKey = stringifyPlayerIdentity(playerIdentity);

        const counts = new Map<string, IPlayerTeammate>();
        for (const teamMember of teamMembers) {
            const key = stringifyPlayerIdentity(teamMember);
            if (key === selfKey) continue; // 排除 target 自己（同隊成員含自己）
            const entry = counts.get(key);
            if (entry) entry.count += 1;
            else counts.set(key, { teamMember, count: 1 });
        }

        return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, count);
    }

    private async resolveTeamMember(playerIdentity: PlayerIdentity): Promise<TeamMember> {
        if (playerIdentity.type === 'Name') return { type: 'Name', name: playerIdentity.name };
        const user = await this.userService.fetchUser({ type: playerIdentity.type, id: playerIdentity.id });
        return { type: playerIdentity.type, id: playerIdentity.id, nickname: user.nickname };
    }
}
