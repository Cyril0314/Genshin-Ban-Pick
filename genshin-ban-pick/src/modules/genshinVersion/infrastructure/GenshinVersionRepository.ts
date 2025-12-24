// src/modules/genshinVersion/infrastructure/GenshinVersionRepository.ts

import type GenshinVersionService from './GenshinVersionService';
import type { IGenshinVersionPeriod } from '@shared/contracts/genshinVersion/IGenshinVersionPeriod';

export default class GenshinVersionRepository {
    constructor(private genshinVersionService: GenshinVersionService) {}

    async fetchGenshinVersionPeriods(): Promise<IGenshinVersionPeriod[]> {
        const response = await this.genshinVersionService.getGenshinVersionPeriods();
        return response.data;
    }
}