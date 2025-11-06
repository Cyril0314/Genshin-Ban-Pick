// src/network/characterService.ts

import api from './httpClient';

import type { HttpClient } from './httpClient';

export function createCharacterService(client: HttpClient = api) {

    async function getCharacters() {
        return client.get('/characters')
    }

    return {
        getCharacters
    }
}

export const characterService = createCharacterService();