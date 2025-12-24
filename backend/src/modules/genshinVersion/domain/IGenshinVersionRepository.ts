// src/modules/genshinVersion/domain/IGenshinVersionRepository.ts

import type { IGenshinVersionPeriod } from "@shared/contracts/genshinVersion/IGenshinVersionPeriod";

export interface IGenshinVersionRepository {
    findAllGenshinVersionPeriods(): Promise<IGenshinVersionPeriod[]>;
}