// backend/src/routes/room.ts

import express from "express";
import type { Request, Response } from 'express';
import {
  numberOfUtility,
  numberOfBan,
  numberOfPick,
  totalRounds,
  teams,
} from "../constants/constants.ts";
import { banPickSteps } from "../utils/banPickSteps.ts";

const router = express.Router();

router.get("/api/room-setting", (req: Request, res: Response) => {
  res.json({
    numberOfUtility,
    numberOfBan,
    numberOfPick,
    totalRounds,
    teams,
    banPickSteps,
  });
});

export default router;
