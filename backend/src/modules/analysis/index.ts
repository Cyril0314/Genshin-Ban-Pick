// src/modules/analysis/index.ts

import AnalysisService from './application/analysis.service';
import AnalysisController from './controller/analysis.controller';
import CharacterFeatureMatrixBuilder from './domain/CharacterFeatureMatrixBuilder';
import CooccurrenceMatrixBuilder from './domain/CooccurrenceMatrixBuilder';
import FeatureMatrixBuilder from './domain/FeatureMatrixBuilder';
import SquareSimilarityMatrixBuilder from './domain/SquareSimilarityMatrixBuilder';
import createAnalysesRouter from './http/analyses.routes';
import CharacterCommunityScanEngine from './infra/clustering/CharacterCommunityScanEngine';
import CharacterSimilarityGraphBuilder from './infra/graph/CharacterSimilarityGraphBuilder';
import MatrixNormalizer from './infra/matrix/MatrixNormalizer';
import DimensionProjector from './infra/projection/DimensionProjector';
import UMAPProjector from './infra/projection/UMAPProjector';

import type { ICharacterRepository } from '../character/domain/ICharacterRepository';
import type { IMatchReadModel } from '../match/domain/IMatchReadModel';
import type { IMatchRepository } from '../match/domain/IMatchRepository';

export function createAnalysisModule(
    characterRepository: ICharacterRepository,
    matchRepository: IMatchRepository,
    matchReadModel: IMatchReadModel,
) {
    const matrixNormalizer = new MatrixNormalizer();
    const umapProjector = new UMAPProjector();
    const dimensionProjector = new DimensionProjector();
    const squareSimilarityMatrixBuilder = new SquareSimilarityMatrixBuilder();
    const cooccurrenceMatrixBuilder = new CooccurrenceMatrixBuilder();
    const characterSimilarityGraphBuilder = new CharacterSimilarityGraphBuilder(squareSimilarityMatrixBuilder);
    const featureMatrixBuilder = new FeatureMatrixBuilder();
    const characterFeatureMatrixBuilder = new CharacterFeatureMatrixBuilder();
    const characterCommunityScanEngine = new CharacterCommunityScanEngine(umapProjector, dimensionProjector, featureMatrixBuilder, matrixNormalizer);

    const service = new AnalysisService(
        matchReadModel,
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
