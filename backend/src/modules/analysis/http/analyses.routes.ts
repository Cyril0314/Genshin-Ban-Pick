// backend/src/modules/analyses/http/analyses.router.ts

import express from 'express';

import { createLogger } from '../../../utils/logger.ts';
import { asyncHandler } from '../../../utils/asyncHandler.ts';
import AnalysisController from '../controller/analysis.controller.ts';

const logger = createLogger('CHARACTER');

export function createAnalysesRouter(analysisController: AnalysisController) {
    const router = express.Router();
    router.get('/tactical-usages', asyncHandler(analysisController.fetchTacticalUsages));
    router.get('/preference', asyncHandler(analysisController.fetchPreference));
    router.get('/synergy', asyncHandler(analysisController.fetchSynergy));
    router.get('/character-clusters', asyncHandler(analysisController.fetchCharacterClusters));

    return router;
}
