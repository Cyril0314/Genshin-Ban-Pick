// backend/src/modules/match/http/matches.router.ts

import express from 'express';

import { createLogger } from '../../../utils/logger';
import { asyncHandler } from '../../../utils/asyncHandler';
import MatchController from '../controller/match.controller';

const logger = createLogger('MATCH');

export function createMatchesRouter(matchController: MatchController) {
    const router = express.Router();
    router.post('/', asyncHandler(matchController.saveMatch))

    return router;
}
