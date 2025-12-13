// src/modules/character/infrastructure/CharacterService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';

export default class CharacterService {
    constructor(private client: HttpClient) {}

    async getCharacters() {
        return this.client.get('/characters');
    }
}