// src/app/appRouter.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';

import { createRoomModule } from '../modules/room';
import { createCharacterModule } from '../modules/character';
import { createMatchModule } from '../modules/match';
import { createAnalysisModule } from '../modules/analysis';
import { createAuthModule } from '../modules/auth';
import { createGenshinVersionModule } from '../modules/genshinVersion';

import type { Express } from 'express';
import type { IRoomStateManager } from '../modules/socket/domain/IRoomStateManager';

export function registerAppRouters(app: Express, prisma: PrismaClient, roomStateManager: IRoomStateManager) {
    const authModule = createAuthModule(prisma);
    app.use('/api/auth', authModule.router);

    const roomModule = createRoomModule(prisma, roomStateManager);
    app.use('/api/rooms', roomModule.router);

    const genshinVersionModule = createGenshinVersionModule(prisma);
    app.use('/api/genshin-versions', genshinVersionModule.router)

    const characterModule = createCharacterModule(prisma);
    app.use('/api/characters', characterModule.router);

    const matchModule = createMatchModule(prisma, roomStateManager);
    app.use('/api/matches', matchModule.router);

    const analysisModule = createAnalysisModule(prisma, characterModule.repository, matchModule.repository);
    app.use('/api/analyses', analysisModule.router);

    return {
        authModule,
        roomModule,
        genshinVersionModule,
        characterModule,
        matchModule,
        analysisModule
    }
}
