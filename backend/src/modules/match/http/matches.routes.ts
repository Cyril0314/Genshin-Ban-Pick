// backend/src/modules/match/http/matches.router.ts

import express from 'express';

import { createLogger } from '../../../utils/logger.ts';
import { asyncHandler } from '../../../utils/asyncHandler.ts';
import MatchController from '../controller/match.controller.ts';

const logger = createLogger('MATCH');

export function createMatchesRouter(matchController: MatchController) {
    const router = express.Router();
    router.post('/', asyncHandler(matchController.saveMatch))

    return router;
}
