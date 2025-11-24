// backend/src/routes/room.ts

import express from 'express';

import RoomService from '../services/room/RoomService.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { createLogger } from '../utils/logger.ts';

import type { Request, Response } from 'express';

const logger = createLogger('ROOM');

export default function roomRoutes(roomService: RoomService) {
    const router = express.Router();
    router.get(
        '/rooms',
        asyncHandler(async (req: Request, res: Response) => {
            const rooms = roomService.fetchRooms();
            res.json(rooms);
        }),
    )

    router.post(
        '/rooms/:roomId',
        asyncHandler(async (req: Request, res: Response) => {
            const { roomId } = req.params;
            const payload = req.body;
            const roomSetting = roomService.buildRoom(roomId, payload);
            res.status(200).json(roomSetting);
        }),
    )

    router.get(
        '/rooms/:roomId/setting',
        asyncHandler(async (req: Request, res: Response) => {
            const { roomId } = req.params;
            const roomSetting = roomService.getRoomSetting(roomId);
            res.json(roomSetting);
        }),
    );

    return router;
}
