// backend/src/modules/genshinVersion/http/genshinVersion.routes.ts

import express from 'express';

import { createLogger } from '../../../utils/logger';
import { asyncHandler } from '../../../utils/asyncHandler';
import GenshinVersionController from '../controller/genshinVersion.controller';


export default function createGenshinVersionsRouter(genshinVersionController: GenshinVersionController) {
    const router = express.Router();
    router.get('/periods', asyncHandler(genshinVersionController.fetchChfetchGenshinVersionPeriodsaracters))

    return router;
}
