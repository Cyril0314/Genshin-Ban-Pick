// src/modules/match/infrastructure/MatchRepository.ts

import type MatchService from './MatchService';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { IMatch } from '@shared/contracts/match/IMatch';

export default class MatchRepository {
    constructor(private matchService: MatchService) {}

    async saveMatch(roomId: string) {
        const response = await this.matchService.post({ roomId });
        return response.data as IMatch;
    }

    async fetchMatch(matchId: number) {
        const response = await this.matchService.get({ matchId });
        return response.data as IMatch;
    }

    async deleteMatch(matchId: number) {
        const response = await this.matchService.delete({ matchId });
    }

    async fetchMatchTeamMembers() {
        const response = await this.matchService.getMatchTeamMembers();
        const matchTeamMembers = response.data;
        return matchTeamMembers as TeamMember[];
    }
}
