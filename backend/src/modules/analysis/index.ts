// src/modules/analysis/index.ts

import { PrismaClient } from '@prisma/client/extension';

import AnalysisController from './controller/analysis.controller.ts';
import AnalysisService from './application/analysis.service.ts';
import { createAnalysesRouter } from './http/analyses.routes.ts';
import { ICharacterProvider } from './domain/ICharacterProvider.ts';

export function createAnalysisModule(prisma: PrismaClient, characterProvider: ICharacterProvider) {
    const service = new AnalysisService(prisma, characterProvider);
    const controller = new AnalysisController(service);
    const router = createAnalysesRouter(controller);
    return { router, controller, service };
}
