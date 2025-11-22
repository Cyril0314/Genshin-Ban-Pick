// src/modules/character/infrastructure/characterService.ts

import api from '@/app/infrastructure/http/httpClient';

import type { HttpClient } from '@/app/infrastructure/http/httpClient';

export function createCharacterService(client: HttpClient = api) {
    async function getCharacters() {
        return client.get('/characters');
    }

    return {
        getCharacters,
    };
}

export const characterService = createCharacterService();
