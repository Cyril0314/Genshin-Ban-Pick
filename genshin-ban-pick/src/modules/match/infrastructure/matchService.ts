// src/modules/room/infrastructure/matchService.ts

import api from '@/app/infrastructure/http/httpClient';

import type { HttpClient } from '@/app/infrastructure/http/httpClient';

export function createMatchService(client: HttpClient = api) {
    async function post(payload: { roomId: string }) {
        return client.post(`/matches`, payload);
    }

    return { post };
}

export const matchService = createMatchService();
