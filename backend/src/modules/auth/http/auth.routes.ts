// backend/src/routes/auth.ts

import express from 'express';

import { createLogger } from '../../../utils/logger.ts';
import { asyncHandler } from '../../../utils/asyncHandler.ts';
import AuthController from '../controller/auth.controller.ts';

export default function createAuthRouter(authController: AuthController) {
    const router = express.Router();
   
    router.post('/register/member', asyncHandler(authController.registerMember));

    router.post('/login/member', asyncHandler(authController.loginMember));

    router.post('/login/guest', asyncHandler(authController.loginGuest));

    router.get('/session', asyncHandler(authController.fetchSession));

    return router;
}
