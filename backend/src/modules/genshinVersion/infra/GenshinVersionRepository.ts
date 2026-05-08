// src/modules/genshinVersion/infra/GenshinVersionRepository.ts

import { Prisma, PrismaClient } from '@prisma/client';

import type { IGenshinVersionRepository } from '../domain/IGenshinVersionRepository';
import type { IGenshinVersionPeriod } from '@shared/contracts/genshinVersion/IGenshinVersionPeriod';

export default class GenshinVersionRepository implements IGenshinVersionRepository {
    constructor(private prisma: PrismaClient) {}

    async findAllGenshinVersionPeriods(): Promise<IGenshinVersionPeriod[]> {
        const versions = await this.prisma.genshinVersion.findMany({
            select: { code: true, startAt: true, endAt: true },
        });
        return versions.map((version) => {
            return {
                code: version.code,
                startAt: version.startAt ?? undefined,
                endAt: version.endAt ?? undefined,
            };
        });
    }
}
