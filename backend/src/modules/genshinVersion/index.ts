// src/modules/genshinVersion/index.ts

import { PrismaClient } from '@prisma/client';

import GenshinVersionController from './controller/genshinVersion.controller';
import GenshinVersionService from './application/genshinVersion.service';
import createGenshinVersionsRouter from './http/genshinVersions.routes';
import GenshinVersionRepository from './infra/GenshinVersionRepository';

export function createGenshinVersionModule(prisma: PrismaClient) {
    const repository = new GenshinVersionRepository(prisma)
    const service = new GenshinVersionService(repository);
    const controller = new GenshinVersionController(service);
    const router = createGenshinVersionsRouter(controller);
    return { router, controller, service, repository };
}