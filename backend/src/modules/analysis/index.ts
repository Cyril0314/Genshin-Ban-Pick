// src/modules/analysis/index.ts

import { PrismaClient } from '@prisma/client/extension';

import AnalysisController from './controller/analysis.controller';
import AnalysisService from './application/analysis.service';
import createAnalysesRouter from './http/analyses.routes';
import ICharacterRepository from '../character/domain/ICharacterRepository';
import { SynergyNormalizationService } from './application/synergy/SynergyNormalizationService';
import { SynergyService } from './application/synergy/SynergyService';
import { ProjectionService } from './application/projection/ProjectionService';
import { ClusteringService } from './application/clustering/ClusteringService';

export function createAnalysisModule(prisma: PrismaClient, characterRepository: ICharacterRepository) {
    const synergyNormalizationService = new SynergyNormalizationService();
    const synergyService = new SynergyService(prisma);
    const projectionService = new ProjectionService();
    const clusteringService = new ClusteringService(projectionService, synergyNormalizationService);
    const service = new AnalysisService(
        prisma,
        synergyNormalizationService,
        synergyService,
        clusteringService,
        projectionService,
        characterRepository,
    );
    const controller = new AnalysisController(service);
    const router = createAnalysesRouter(controller);
    return { router, controller, service };
}
