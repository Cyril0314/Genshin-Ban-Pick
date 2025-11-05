// backend/src/routes/room.ts

import express from 'express';

import RoomService from '../services/room/RoomService.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { createLogger } from '../utils/logger.ts';

import type { Request, Response } from 'express';

const logger = createLogger('ROOM')

export default function roomRoutes(roomService: RoomService) {
    const router = express.Router();

    router.get(
        '/rooms/setting',
        asyncHandler(async (req: Request, res: Response) => {
            const roomSetting = roomService.getRoomSetting();
            res.json(roomSetting);
        }),
    );

    router.post(
        '/rooms/:roomId/save',
        asyncHandler(async (req: Request, res: Response) => {
            const { roomId } = req.params;
            const roomSetting = req.body;
            logger.debug(`[POST] Received /rooms/:roomId/save`, roomId, roomSetting)
            await roomService.save(roomId, roomSetting);

            res.status(200).send({meesage: 'Record received'});
        }),
    );

    return router;
}
