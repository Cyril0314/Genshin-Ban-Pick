// backend/src/modules/room/controller/room.controller.ts

import { Request, Response } from 'express';
import RoomService from '../application/room.service.ts';

export default class RoomController {
    constructor(private roomService: RoomService) {}

    fetchRooms = async (req: Request, res: Response) => {
        const rooms = this.roomService.fetchRooms();
        res.status(200).json(rooms);
    };

    buildRoom = async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const payload = req.body;
        const roomSetting = this.roomService.buildRoom(roomId, payload);
        res.status(200).json(roomSetting);
    };

    getRoomSetting = async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const roomSetting = this.roomService.getRoomSetting(roomId);
        res.status(200).json(roomSetting);
    };
}
