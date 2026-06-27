// src/modules/match/infrastructure/MatchService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { ITimeWindowQuery } from '@shared/contracts/common/dto/ITimeWindowQuery';

export default class MatchService {
    constructor(private client: HttpClient) {}

    async post(payload: { roomId: string }) {
        return this.client.post(`/matches`, payload);
    }

    async get(payload: { matchId: number }) {
        return this.client.get(`/matches/${payload.matchId}`);
    }

    async delete(payload: { matchId: number }) {
        return this.client.delete(`/matches/${payload.matchId}`);
    }

    async getMatchTeamMembers() {
        return this.client.get(`/matches/team-members`);
    }

    async getMatchTimestamps(query?: ITimeWindowQuery) {
        return this.client.get(`/matches/timestamps`, { params: query });
    }
}
