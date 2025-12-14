// src/modules/match/infrastructure/MatchService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';

export default class MatchService {
    constructor(private client: HttpClient) {}

    async post(payload: { roomId: string }) {
        return this.client.post(`/matches`, payload);
    }

    async delete(payload: { matchId: number }) {
        return this.client.delete(`/matches/${payload.matchId}`);
    }

    async getMatchTeamMembers() {
        return this.client.get(`/matches/team-members`);
    }
}
