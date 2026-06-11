// backend/src/modules/analysis/http/analyses.routes.ts

import express from 'express';

import { asyncHandler } from '../../../utils/asyncHandler';
import AnalysisController from '../controller/analysis.controller';

export default function createAnalysesRouter(analysisController: AnalysisController) {
    const router = express.Router();
    router.get('/match-overview', asyncHandler(analysisController.fetchMatchOverview))

    router.get('/character-usages/summary', asyncHandler(analysisController.fetchCharacterUsageSummary));
    router.get('/character-usages/pick-priority', asyncHandler(analysisController.fetchCharacterUsagePickPriority));

    router.get('/character-cooccurrence/matrix', asyncHandler(analysisController.fetchCharacterCooccurrenceMatrix));
    router.get('/character-cluster', asyncHandler(analysisController.fetchCharacterCluster));

    router.get('/player-styles', asyncHandler(analysisController.fetchPlayerStyle));

    router.get('/character-attribute/distributions', asyncHandler(analysisController.fetchCharacterAttributeDistributions))

    return router;
}
