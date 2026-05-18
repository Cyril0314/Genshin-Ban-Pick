// backend/src/modules/room/http/rooms.routes.ts

import express from 'express';

import { asyncHandler } from '../../../utils/asyncHandler';
import RoomController from '../controller/room.controller';

export default function createRoomsRouter(roomController: RoomController) {
    const router = express.Router();
    router.get('/', asyncHandler(roomController.fetchRooms))

    router.post('/:roomId', asyncHandler(roomController.buildRoom));

    router.get('/:roomId/setting', asyncHandler(roomController.getRoomSetting));

    return router;
}
