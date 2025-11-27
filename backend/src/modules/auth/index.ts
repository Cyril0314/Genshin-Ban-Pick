// src/modules/auth/index.ts

import { PrismaClient } from '@prisma/client/extension';

import AuthController from './controller/auth.controller';
import AuthService from './application/auth.service';
import createAuthRouter from './http/auth.routes';
import MemberService from './application/member.service';
import GuestService from './application/guest.service';
import JwtProvider from './infra/JwtProvider';
import MemberRepository from './infra/MemberRepository';
import GuestRepository from './infra/GuestRepository';

export function createAuthModule(prisma: PrismaClient) {
    const memberRepository = new MemberRepository(prisma);
    const guestRepository = new GuestRepository(prisma);
    const memberService = new MemberService(memberRepository);
    const guestService = new GuestService(guestRepository);
    const jwtProvider = new JwtProvider();
    const authService = new AuthService(memberService, guestService, jwtProvider);
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
