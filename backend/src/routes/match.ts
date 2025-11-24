// backend/src/routes/match.ts

import express from 'express';

import { asyncHandler } from '../utils/asyncHandler.ts';
import { createLogger } from '../utils/logger.ts';
import { MatchService } from '../services/match/MatchService.ts';

import type { Request, Response } from 'express';

const logger = createLogger('MATCH');

export default function matchRoutes(matchService: MatchService) {
    const router = express.Router();

    router.post(
        '/matches',
        asyncHandler(async (req: Request, res: Response) => {
            const { roomId } = req.body;
            const matchData = await matchService.saveMatch(roomId);

            res.status(200).json({ matchData });
        }),
    );

    return router;
}
