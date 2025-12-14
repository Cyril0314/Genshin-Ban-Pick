// src/modules/match/infrastructure/MatchRepository.ts

import type MatchService from "./MatchService";

export default class MatchRepository {
    constructor(private matchService: MatchService) {}

    async saveMatch(roomId: string) {
        const response = await this.matchService.post({ roomId });
        const matchData = response.data;
        return matchData;
    }

    async deleteMatch(matchId: number) {
        const response = await this.matchService.delete({ matchId });
    }

    async fetchMatchTeamMembers() {
        const response = await this.matchService.getMatchTeamMembers();
        const matchTeamMembers = response.data;
        return matchTeamMembers;
    }
}
