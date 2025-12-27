// backend/src/modules/genshinVersion/application/genshinVersion.service.ts

import { DataNotFoundError } from '../../../errors/AppError';

import type { IGenshinVersionRepository } from '../domain/IGenshinVersionRepository';

export default class GenshinVersionService {
    constructor(private genshinVersionRepository: IGenshinVersionRepository) {}

    async fetchGenshinVersionPeriods() {
        const periods = await this.genshinVersionRepository.findAllGenshinVersionPeriods();
        if (!periods || periods.length === 0) {
            throw new DataNotFoundError();
        }
        return periods;
    }
}
