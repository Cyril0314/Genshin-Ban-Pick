// backend/src/modules/analysis/http/analyses.routes.ts

import express from 'express';

import { createLogger } from '../../../utils/logger';
import { asyncHandler } from '../../../utils/asyncHandler';
import AnalysisController from '../controller/analysis.controller';

const logger = createLogger('CHARACTER');

export default function createAnalysesRouter(analysisController: AnalysisController) {
    const router = express.Router();
    router.get('/character/tactical-usages', asyncHandler(analysisController.fetchCharacterTacticalUsages));
    router.get('/character/pick-priority', asyncHandler(analysisController.fetchCharacterPickPriority));

    router.get('/character/synergy-matrix', asyncHandler(analysisController.fetchCharacterSynergyMatrix));
    router.get('/character/synergy-graph', asyncHandler(analysisController.fetchCharacterSynergyGraph));
    router.get('/character/clusters', asyncHandler(analysisController.fetchCharacterClusters));
    router.get('/player/preference', asyncHandler(analysisController.fetchPlayerPreference));
    router.get('/player/style-profile', asyncHandler(analysisController.fetchPlayerStyleProfile));

    return router;
}
