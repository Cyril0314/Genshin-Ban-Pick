// src/modules/room/index.ts

import { PrismaClient } from '@prisma/client/extension';

import RoomController from './controller/room.controller';
import RoomService from './application/room.service';
import RoomUserService from './application/roomUser.service';
import RoomStateRepository from './infra/RoomStateRepository';
import createRoomsRouter from './http/rooms.routes';

import type { IRoomStateRepository } from './domain/IRoomStateRepository';
import type { IRoomStateManager } from '../socket/domain/IRoomStateManager';

// import {  } from './domain/IRoomState'

export { RoomUserService, RoomStateRepository, IRoomStateRepository };

export function createRoomModule(prisma: PrismaClient, roomStateManager: IRoomStateManager) {

    const repository = new RoomStateRepository(roomStateManager);
    const service = new RoomService(repository);
    const controller = new RoomController(service);
    const router = createRoomsRouter(controller);
    return { router, controller, service };
}
