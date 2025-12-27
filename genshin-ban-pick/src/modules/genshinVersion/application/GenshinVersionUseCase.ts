// src/modules/genshinVersion/application/GenshinVersionUseCase.ts

import type GenshinVersionRepository from '../infrastructure/GenshinVersionRepository';

export default class GenshinVersionUseCase {
    constructor(private genshinVersionRepository: GenshinVersionRepository) {}

    async fetchGenshinVersionPeriods() {
        const genshinVersionPeriods = await this.genshinVersionRepository.fetchGenshinVersionPeriods();

        return genshinVersionPeriods.map((period) => ({
            ...period,
            startAt: new Date(period.startAt),
            endAt: period.endAt ? new Date(period.endAt) : undefined,
        }));
    }
}