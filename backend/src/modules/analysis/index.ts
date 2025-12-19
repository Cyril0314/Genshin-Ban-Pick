// src/modules/analysis/index.ts

import { PrismaClient } from '@prisma/client/extension';

import AnalysisController from './controller/analysis.controller';
import AnalysisService from './application/analysis.service';
import AnalysisRepository from './infra/AnalysisRepository';
import createAnalysesRouter from './http/analyses.routes';
import SquareSimilarityMatrixBuilder from './infra/matrix/SquareSimilarityMatrixBuilder';
import CharacterSynergyCalculator from './infra/synergy/CharacterSynergyCalculator';
import CharacterSynergyGraphBuilder from './infra/graph/CharacterSynergyGraphBuilder';
import FeatureMatrixBuilder from './infra/matrix/FeatureMatrixBuilder';
import CharacterFeatureMatrixBuilder from './infra/character/CharacterFeatureMatrixBuilder';
import MatrixNormalizer from './infra/matrix/MatrixNormalizer';
import DimensionProjector from './infra/projection/DimensionProjector';
import UMAPProjector from './infra/projection/UMAPProjector';
import CharacterCommunityScanEngine from './infra/clustering/CharacterCommunityScanEngine';

import type { ICharacterRepository } from '../character/domain/ICharacterRepository';
import type { IMatchRepository } from '../match/domain/IMatchRepository';

export function createAnalysisModule(prisma: PrismaClient, characterRepository: ICharacterRepository, matchRepository: IMatchRepository) {
    const analysisRepository = new AnalysisRepository(prisma)

    const matrixNormalizer = new MatrixNormalizer();
    const characterSynergyCalculator = new CharacterSynergyCalculator();
    const umapProjector = new UMAPProjector();
    const dimensionProjector = new DimensionProjector();
    const squareSimilarityMatrixBuilder = new SquareSimilarityMatrixBuilder()
    const characterSynergyGraphBuilder = new CharacterSynergyGraphBuilder(squareSimilarityMatrixBuilder)
    const featureMatrixBuilder = new FeatureMatrixBuilder()
    const characterFeatureMatrixBuilder = new CharacterFeatureMatrixBuilder()
    const characterCommunityScanEngine = new CharacterCommunityScanEngine(umapProjector, dimensionProjector, featureMatrixBuilder, matrixNormalizer);

    const service = new AnalysisService(
        analysisRepository,
        characterSynergyCalculator,
        characterSynergyGraphBuilder,
        characterFeatureMatrixBuilder,
        characterCommunityScanEngine,
        characterRepository,
        matchRepository,
    );

    const controller = new AnalysisController(service);
    const router = createAnalysesRouter(controller);

    // service.fetchGlobalStatistic();

    return { router, controller, service };
}
