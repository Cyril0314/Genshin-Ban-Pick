// backend/src/routes/room.ts

import express from "express";
import type { Request, Response } from 'express';
import {
  numberOfUtility,
  numberOfBan,
  numberOfPick,
  totalRounds,
} from "../constants/constants.ts";
import { banPickFlow } from "../banPickFlow.ts";

const router = express.Router();

router.get("/api/room-setting", (req: Request, res: Response) => {
  res.json({
    numberOfUtility,
    numberOfBan,
    numberOfPick,
    totalRounds,
    banPickFlow,
  });
});

export default router;
