// src/modules/genshinVersion/infrastructure/GenshinVersionService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';

export default class GenshinVersionService {
    constructor(private client: HttpClient) {}

    async getGenshinVersionPeriods() {
        return this.client.get('/genshin-versions/periods');
    }
}