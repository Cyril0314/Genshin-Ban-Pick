// src/app/appRouter.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';

import { createRoomModule } from '../modules/room/index.ts';
import { IRoomStateManager } from '../modules/socket/managers/IRoomStateManager.ts';

import type { Express } from 'express';
import { createCharacterModule } from '../modules/character/index.ts';
import { createMatchModule } from '../modules/match/index.ts';
import { createAnalysisModule } from '../modules/analysis/index.ts';
import { createAuthModule } from '../modules/auth/index.ts';

export function registerAppRouters(app: Express, prisma: PrismaClient, roomStateManager: IRoomStateManager) {
    const authModule = createAuthModule(prisma);
    app.use('/api/auth', authModule.router);

    const roomModule = createRoomModule(prisma, roomStateManager);
    app.use('/api/rooms', roomModule.router);

    const characterModule = createCharacterModule(prisma);
    app.use('/api/characters', characterModule.router);

    const matchModule = createMatchModule(prisma, roomStateManager);
    app.use('/api/matches', matchModule.router);

    const analysisModule = createAnalysisModule(prisma, characterModule.service);
    app.use('/api/analyses', analysisModule.router);

    return {
        authModule,
        roomModule,
        characterModule,
        matchModule,
        analysisModule
    }
}
