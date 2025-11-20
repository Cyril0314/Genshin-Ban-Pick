// src/network/characterService.ts

import api from '../infrastructure/http/httpClient';

import type { HttpClient } from '../infrastructure/http/httpClient';

export function createCharacterService(client: HttpClient = api) {
    async function getCharacters() {
        return client.get('/characters');
    }

    return {
        getCharacters,
    };
}

export const characterService = createCharacterService();
