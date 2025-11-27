// backend/src/routes/auth.ts

import express from 'express';

import { createLogger } from '../../../utils/logger';
import { asyncHandler } from '../../../utils/asyncHandler';
import AuthController from '../controller/auth.controller';

export default function createAuthRouter(authController: AuthController) {
    const router = express.Router();
   
    router.post('/register/member', asyncHandler(authController.registerMember));

    router.post('/login/member', asyncHandler(authController.loginMember));

    router.post('/login/guest', asyncHandler(authController.loginGuest));

    router.get('/session', asyncHandler(authController.fetchSession));

    return router;
}
