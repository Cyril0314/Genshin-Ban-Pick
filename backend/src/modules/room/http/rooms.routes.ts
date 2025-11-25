// backend/src/modules/room/http/room.router.ts

import express from 'express';

import { createLogger } from '../../../utils/logger.ts';
import { asyncHandler } from '../../../utils/asyncHandler.ts';
import RoomController from '../controller/room.controller.ts';

const logger = createLogger('ROOM');

export function createRoomsRouter(roomController: RoomController) {
    const router = express.Router();
    router.get('/', asyncHandler(roomController.fetchRooms))

    router.post('/:roomId', asyncHandler(roomController.buildRoom));

    router.get('/:roomId/setting', asyncHandler(roomController.getRoomSetting));

    return router;
}
