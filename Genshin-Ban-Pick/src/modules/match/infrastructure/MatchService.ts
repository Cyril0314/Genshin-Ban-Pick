// src/modules/match/infrastructure/MatchService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';

export default class MatchService {
    constructor(private client: HttpClient) {}

    async post(payload: { roomId: string }) {
        return this.client.post(`/matches`, payload);
    }
}
