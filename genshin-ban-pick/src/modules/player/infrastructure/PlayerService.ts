// src/modules/player/infrastructure/PlayerService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { IPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';

export default class PlayerService {
    constructor(private client: HttpClient) {}

    async getPlayerRecord(query: IPlayerIdentityQuery) {
        return this.client.get(`/players/records`, { params: query });
    }

    async getPlayerMatches(query: IPlayerIdentityQuery) {
        return this.client.get(`/players/matches`, { params: query });
    }

    async getPlayerTeammates(query: IPlayerIdentityQuery) {
        return this.client.get(`/players/teammates`, { params: query });
    }
}
