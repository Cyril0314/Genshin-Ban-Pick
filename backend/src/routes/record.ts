// backend/src/routes/recordt.js

import express from "express";
import type { Request, Response } from "express";
// import { imageState, teamMembersState } from "../socket/socketController.ts";

const router = express.Router();

router.post("/api/record", (req: Request, res: Response) => {
  // console.log(`imageState ${JSON.stringify(imageState, null, 2)}`);
  // console.log(`teamMembersState ${JSON.stringify(teamMembersState, null, 2)}`);
  res.status(200).send("Record received");
});

export default router;