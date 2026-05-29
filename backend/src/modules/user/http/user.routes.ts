import express from 'express';

import { asyncHandler } from '../../../utils/asyncHandler';
import type UserController from '../controller/user.controller';
import type { RequestHandler } from 'express';

export default function createUserRouter(controller: UserController, requireAuth: RequestHandler) {
    const router = express.Router();
    router.get('/me', requireAuth, asyncHandler(controller.getMe));
    return router;
}
