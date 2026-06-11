// src/modules/analysis/index.ts

import AnalysisController from './controller/analysis.controller';
import AnalysisService from './application/analysis.service';
import createAnalysesRouter from './http/analyses.routes';
import SquareSimilarityMatrixBuilder from './domain/SquareSimilarityMatrixBuilder';
import CooccurrenceMatrixBuilder from './domain/CooccurrenceMatrixBuilder';
import CooccurrenceCalculator from './domain/CooccurrenceCalculator';
import CharacterSimilarityGraphBuilder from './infra/graph/CharacterSimilarityGraphBuilder';
import FeatureMatrixBuilder from './domain/FeatureMatrixBuilder';
import CharacterFeatureMatrixBuilder from './domain/CharacterFeatureMatrixBuilder';
import MatrixNormalizer from './infra/matrix/MatrixNormalizer';
import DimensionProjector from './infra/projection/DimensionProjector';
import UMAPProjector from './infra/projection/UMAPProjector';
import CharacterCommunityScanEngine from './infra/clustering/CharacterCommunityScanEngine';

import type { ICharacterRepository } from '../character/domain/ICharacterRepository';
import type { IMatchRepository } from '../match/domain/IMatchRepository';
import type { IMatchReadModel } from '../match/domain/IMatchReadModel';

export function createAnalysisModule(
    characterRepository: ICharacterRepository,
    matchRepository: IMatchRepository,
    matchReadModel: IMatchReadModel,
) {
    const matrixNormalizer = new MatrixNormalizer();
    const umapProjector = new UMAPProjector();
    const dimensionProjector = new DimensionProjector();
    const squareSimilarityMatrixBuilder = new SquareSimilarityMatrixBuilder();
    const cooccurrenceCalculator = new CooccurrenceCalculator();
    const cooccurrenceMatrixBuilder = new CooccurrenceMatrixBuilder();
    const characterSimilarityGraphBuilder = new CharacterSimilarityGraphBuilder(squareSimilarityMatrixBuilder);
    const featureMatrixBuilder = new FeatureMatrixBuilder();
    const characterFeatureMatrixBuilder = new CharacterFeatureMatrixBuilder();
    const characterCommunityScanEngine = new CharacterCommunityScanEngine(umapProjector, dimensionProjector, featureMatrixBuilder, matrixNormalizer);

    const service = new AnalysisService(
        matchReadModel,
        cooccurrenceCalculator,
        cooccurrenceMatrixBuilder,
        characterSimilarityGraphBuilder,
        characterFeatureMatrixBuilder,
        characterCommunityScanEngine,
        characterRepository,
        matchRepository,
    );

    const controller = new AnalysisController(service);
    const router = createAnalysesRouter(controller);

    return { router, controller, service };
}
