// src/modules/genshinVersion/infra/GenshinVersionRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';

import type { IGenshinVersionRepository } from '../domain/IGenshinVersionRepository';
import type { IGenshinVersionPeriod } from '@shared/contracts/genshinVersion/IGenshinVersionPeriod';

export default class GenshinVersionRepository implements IGenshinVersionRepository {
    constructor(private prisma: PrismaClient) {}

    async findAllGenshinVersionPeriods(): Promise<IGenshinVersionPeriod[]> {
        return await this.prisma.genshinVersion.findMany({
            select: { code: true, startAt: true, endAt: true },
        });
    }
}
