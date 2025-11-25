// src/modules/room/index.ts

import { PrismaClient } from '@prisma/client/extension';
import { IRoomStateManager } from '../socket/managers/IRoomStateManager.ts';

import RoomController from './controller/room.controller.ts';
import RoomService from './application/room.service.ts';
import RoomUserService from './application/roomUser.service.ts';
import RoomStateRepository from './infra/RoomStateRepository.ts';
import { createRoomsRouter } from './http/rooms.routes.ts';

import type { IRoomStateRepository } from './domain/IRoomStateRepository.ts';
import type { IRoomSetting } from './domain/IRoomSetting.ts';
import type { IRoomUser } from './types/IRoomUser.ts';

// import {  } from './domain/IRoomState.ts'

export { IRoomSetting, IRoomUser, RoomUserService, RoomStateRepository, IRoomStateRepository };
export * from './domain/IRoomState.ts';

export function createRoomModule(prisma: PrismaClient, roomStateManager: IRoomStateManager) {

    const repo = new RoomStateRepository(roomStateManager);
    const service = new RoomService(prisma, repo);
    const controller = new RoomController(service);
    const router = createRoomsRouter(controller);
    return { router, controller, service };
}
