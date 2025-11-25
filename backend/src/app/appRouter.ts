// src/app/appRouter.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';

import { createRoomModule } from '../modules/room/index.ts';
import { IRoomStateManager } from '../modules/socket/managers/IRoomStateManager.ts';

import type { Express } from 'express';

export function registerAppRouters(app: Express, prisma: PrismaClient, roomStateManager: IRoomStateManager) {
    const roomModule = createRoomModule(prisma, roomStateManager)
    app.use('/api/rooms', roomModule.router);
}
