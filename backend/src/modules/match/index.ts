// src/modules/match/index.ts

import { PrismaClient } from '@prisma/client/extension';

import MatchController from './controller/match.controller';
import MatchService from './application/match.service';
import { createMatchesRouter } from './http/matches.routes';

import IRoomStateManager from '../socket/domain/IRoomStateManager';
import MatchSnapshotRepository from './infra/MatchSnapshotRepository';
import { MatchRepository } from './infra/MatchRepository';

export function createMatchModule(prisma: PrismaClient, roomStateManager: IRoomStateManager) {
    const matchRepository = new MatchRepository(prisma);
    const matchSnapshotRepository = new MatchSnapshotRepository(roomStateManager);
    const service = new MatchService(matchRepository, matchSnapshotRepository);
    const controller = new MatchController(service);
    const router = createMatchesRouter(controller);
    return { router, controller, service };
}
