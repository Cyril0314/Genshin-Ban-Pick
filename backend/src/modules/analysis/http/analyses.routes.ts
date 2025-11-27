// backend/src/modules/analyses/http/analyses.router.ts

import express from 'express';

import { createLogger } from '../../../utils/logger';
import { asyncHandler } from '../../../utils/asyncHandler';
import AnalysisController from '../controller/analysis.controller';

const logger = createLogger('CHARACTER');

export default function createAnalysesRouter(analysisController: AnalysisController) {
    const router = express.Router();
    router.get('/tactical-usages', asyncHandler(analysisController.fetchTacticalUsages));
    router.get('/preference', asyncHandler(analysisController.fetchPreference));
    router.get('/synergy', asyncHandler(analysisController.fetchSynergy));
    router.get('/character-clusters', asyncHandler(analysisController.fetchCharacterClusters));

    return router;
}
