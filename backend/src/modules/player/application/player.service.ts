// src/modules/player/application/player.service.ts

import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import type { IMatchRepository } from '../../match/domain/IMatchRepository';
import type { IPlayerMatchReadModel } from '../../match/domain/IPlayerMatchReadModel';
import type UserService from '../../user/application/user.service';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IPlayerMatchSummary } from '@shared/contracts/player/IPlayerMatchSummary';
import type { IPlayerCharacterFrequency, IPlayerRecord } from '@shared/contracts/player/IPlayerRecord';
import type { IPlayerSummary } from '@shared/contracts/player/IPlayerSummary';
import type { IPlayerTeammate } from '@shared/contracts/player/IPlayerTeammate';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

export default class PlayerService {
    constructor(
        private matchRepository: IMatchRepository,
        private playerMatchReadModel: IPlayerMatchReadModel,
        private userService: UserService,
    ) {}

    async fetchPlayers(): Promise<IPlayerSummary[]> {
        const [teamMembers, lineupSlots] = await Promise.all([
            this.matchRepository.findMatchTeamMembers(), // 全站 team members（含重複）
            this.matchRepository.findMatchLineupSlotLights(), // 全站 lineup slots（玩家 ↔ 角色）
        ]);

        // 每位玩家各角色的被選次數（key → characterKey → count）
        const characterCountsByKey = new Map<string, Map<string, number>>();
        for (const row of lineupSlots) {
            const key = stringifyPlayerIdentity(row.teamMember);
            let counts = characterCountsByKey.get(key);
            if (!counts) characterCountsByKey.set(key, (counts = new Map()));
            counts.set(row.characterKey, (counts.get(row.characterKey) ?? 0) + 1);
        }

        // team members 去重 → 計參與場次，併入角色統計（去重數 + 本命角色）
        const playerByKey = new Map<string, IPlayerSummary>();
        for (const teamMember of teamMembers) {
            const key = stringifyPlayerIdentity(teamMember);
            const entry = playerByKey.get(key);
            if (entry) entry.matchCount += 1;
            else playerByKey.set(key, { teamMember, matchCount: 1, ...this.summarizeCharacters(characterCountsByKey.get(key)) });
        }

        return [...playerByKey.values()].sort((a, b) => b.matchCount - a.matchCount);
    }

    // 角色使用次數 → 去重角色數 + 本命角色（次數最多者，同票時取先出現者）
    private summarizeCharacters(counts: Map<string, number> | undefined): Pick<IPlayerSummary, 'characterCount' | 'signatureCharacter'> {
        if (!counts || counts.size === 0) return { characterCount: 0 };

        let signatureCharacter: string | undefined;
        let max = 0;
        for (const [characterKey, count] of counts) {
            if (count > max) {
                max = count;
                signatureCharacter = characterKey;
            }
        }

        return { characterCount: counts.size, signatureCharacter };
    }

    async fetchPlayerRecord(playerIdentity: PlayerIdentity, count = 10): Promise<IPlayerRecord> {
        const lineupSlots = await this.matchRepository.findMatchLineupSlotLights(playerIdentity);
        const teamMember = await this.resolveTeamMember(playerIdentity);

        const totalSetups = lineupSlots.length;

        const characterCounts: Record<string, number> = {};
        for (const lineupSlot of lineupSlots) {
            characterCounts[lineupSlot.characterKey] = (characterCounts[lineupSlot.characterKey] ?? 0) + 1;
        }

        const characterFrequency: IPlayerCharacterFrequency[] = Object.entries(characterCounts)
            .sort((a, b) => b[1] - a[1])
            // .slice(0, count)
            .map(([characterKey, count]) => ({
                characterKey,
                count,
                rate: totalSetups > 0 ? count / totalSetups : 0,
            }));

        return { teamMember, totalSetups, characterFrequency };
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

        const byKey = new Map<string, IPlayerTeammate>();
        for (const teamMember of teamMembers) {
            const key = stringifyPlayerIdentity(teamMember);
            if (key === selfKey) continue; // 排除 target 自己（同隊成員含自己）
            const entry = byKey.get(key);
            if (entry) entry.count += 1;
            else byKey.set(key, { teamMember, count: 1 });
        }

        return [...byKey.values()].sort((a, b) => b.count - a.count).slice(0, count);
    }

    private async resolveTeamMember(playerIdentity: PlayerIdentity): Promise<TeamMember> {
        if (playerIdentity.type === 'Name') return { type: 'Name', name: playerIdentity.name };
        const user = await this.userService.fetchUser({ type: playerIdentity.type, id: playerIdentity.id });
        return { type: playerIdentity.type, id: playerIdentity.id, nickname: user.nickname };
    }
}
