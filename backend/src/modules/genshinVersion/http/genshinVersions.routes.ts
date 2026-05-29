// backend/src/modules/genshinVersion/http/genshinVersion.routes.ts

import express from 'express';

import { asyncHandler } from '../../../utils/asyncHandler';
import GenshinVersionController from '../controller/genshinVersion.controller';


export default function createGenshinVersionRouter(controller: GenshinVersionController) {
    const router = express.Router();
    router.get('/periods', asyncHandler(controller.fetchGenshinVersionPeriods));

    return router;
}
