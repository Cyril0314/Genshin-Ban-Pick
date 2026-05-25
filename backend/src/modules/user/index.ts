import { PrismaClient } from '@prisma/client';

import UserService from './application/user.service';
import UserController from './controller/user.controller';
import createUserRouter from './http/user.routes';
import MemberRepository from './infra/MemberRepository';
import GuestRepository from './infra/GuestRepository';

import type { RequestHandler } from 'express';

export function createUserModule(prisma: PrismaClient, requireAuth: RequestHandler) {
    const memberRepository = new MemberRepository(prisma);
    const guestRepository = new GuestRepository(prisma);
    const userService = new UserService(memberRepository, guestRepository);
    const controller = new UserController(userService);
    const router = createUserRouter(controller, requireAuth);
    return { router, userService };
}
