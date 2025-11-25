// src/modules/auth/index.ts

import { PrismaClient } from '@prisma/client/extension';

import AuthController from './controller/auth.controller.ts';
import AuthService from './application/auth.service.ts';
import createAuthRouter from './http/auth.routes.ts';
import MemberService from './application/member.service.ts';
import GuestService from './application/guest.service.ts';
import JwtProvider from './infra/JwtProvider.ts';

export function createAuthModule(prisma: PrismaClient) {
    const memberService = new MemberService(prisma);
    const guestService = new GuestService(prisma);
    const jwtProvider = new JwtProvider();
    const authService = new AuthService(prisma, memberService, guestService, jwtProvider);
    const controller = new AuthController(authService);
    const router = createAuthRouter(controller);
    return {
        router,
        controller,
        authService,
        memberService,
        guestService,
        jwtProvider,
    };
}
