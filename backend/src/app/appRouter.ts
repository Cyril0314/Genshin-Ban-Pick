// src/app/appRouter.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';

import { createRoomModule } from '../modules/room';
import { createCharacterModule } from '../modules/character';
import { createMatchModule } from '../modules/match';
import { createAnalysisModule } from '../modules/analysis';
import { createPlayerModule } from '../modules/player';
import { createAuthModule } from '../modules/auth';
import { createUserModule } from '../modules/user';
import { createGenshinVersionModule } from '../modules/genshinVersion';
import { createRequireAuth } from '../middlewares/requireAuth';

import type { Express } from 'express';
import type { IRoomStateManager } from '../modules/room/domain/IRoomStateManager';
import type { IJwtProvider } from '../modules/auth/domain/IJwtProvider';

export function registerAppRouters(app: Express, prisma: PrismaClient, roomStateManager: IRoomStateManager, jwtProvider: IJwtProvider) {
    const requireAuth = createRequireAuth(jwtProvider);

    const userModule = createUserModule(prisma, requireAuth);
    app.use('/api/users', userModule.router);

    const authModule = createAuthModule(userModule.userService, jwtProvider);
    app.use('/api/auth', authModule.router);

    const roomModule = createRoomModule(prisma, roomStateManager);
    app.use('/api/rooms', roomModule.router);

    const genshinVersionModule = createGenshinVersionModule(prisma);
    app.use('/api/genshin-versions', genshinVersionModule.router);

    const characterModule = createCharacterModule(prisma);
    app.use('/api/characters', characterModule.router);

    const matchModule = createMatchModule(prisma, roomStateManager);
    app.use('/api/matches', matchModule.router);

    const analysisModule = createAnalysisModule(characterModule.repository, matchModule.repository, matchModule.readModel);
    app.use('/api/analyses', analysisModule.router);

    const playerModule = createPlayerModule(matchModule.playerMatchReadModel, matchModule.repository, userModule.userService);
    app.use('/api/players', playerModule.router);

    return {
        userModule,
        roomModule,
        genshinVersionModule,
        characterModule,
        matchModule,
        analysisModule,
        playerModule,
    };
}
