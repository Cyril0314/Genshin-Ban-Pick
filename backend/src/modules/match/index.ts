// src/modules/match/index.ts

import { PrismaClient } from '@prisma/client/extension';

import MatchController from './controller/match.controller.ts';
import MatchService from './application/match.service.ts';
import { createMatchesRouter } from './http/matches.routes.ts';

import { IRoomStateManager } from '../socket/managers/IRoomStateManager.ts';
import { MatchSnapshotRepository } from './infra/MatchSnapshotRepository.ts';

export function createMatchModule(prisma: PrismaClient, roomStateManager: IRoomStateManager) {

    const repo = new MatchSnapshotRepository(roomStateManager);
    const service = new MatchService(prisma, repo);
    const controller = new MatchController(service);
    const router = createMatchesRouter(controller);
    return { router, controller, service };
}
