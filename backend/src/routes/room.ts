// backend/src/routes/room.ts

import express from "express";

import RoomService from "../services/RoomService.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

import type { Request, Response } from 'express';

export default function roomRoutes(roomService: RoomService) {
  const router = express.Router();

  router.get("/room/setting", asyncHandler(async (req: Request, res: Response) => {
    const roomSetting = roomService.getRoomSetting();
    res.json(roomSetting);
  }));

  router.post("/room/record", asyncHandler(async (req: Request, res: Response) => {
    // console.log(`imageState ${JSON.stringify(imageState, null, 2)}`);
    // console.log(`teamMembersState ${JSON.stringify(teamMembersState, null, 2)}`);
    res.status(200).send("Record received");
  }));

  return router;
}
