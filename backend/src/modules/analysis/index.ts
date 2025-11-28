// src/modules/analysis/index.ts

import { PrismaClient } from '@prisma/client/extension';

import AnalysisController from './controller/analysis.controller';
import AnalysisService from './application/analysis.service';
import AnalysisRepository from './infra/AnalysisRepository';
import createAnalysesRouter from './http/analyses.routes';
import CharacterSynergyCalculator from './infra/synergy/CharacterSynergyCalculator';
import SynergyFeatureNormalizer from './infra/synergy/SynergyFeatureNormalizer';
import DimensionProjector from './infra/projection/DimensionProjector';
import CharacterCommunityScanEngine from './infra/clustering/CharacterCommunityScanEngine';

import type { ICharacterRepository } from '../character/domain/ICharacterRepository';

export function createAnalysisModule(prisma: PrismaClient, characterRepository: ICharacterRepository) {
    const analysisRepository = new AnalysisRepository(prisma)
    const synergyFeatureNormalizer = new SynergyFeatureNormalizer();
    const characterSynergyCalculator = new CharacterSynergyCalculator();
    const dimensionProjector = new DimensionProjector();
    const characterCommunityScanEngine = new CharacterCommunityScanEngine(dimensionProjector, synergyFeatureNormalizer);
    const service = new AnalysisService(
        analysisRepository,
        characterSynergyCalculator,
        characterCommunityScanEngine,
        characterRepository,
    );
    const controller = new AnalysisController(service);
    const router = createAnalysesRouter(controller);
    return { router, controller, service };
}
