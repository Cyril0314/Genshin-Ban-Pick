// backend/src/routes/auth.ts

import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../db.ts";

dotenv.config();

const router = express.Router();

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { account, password, nickname } = req.body as {
      account: string;
      password: string;
      nickname: string;
    };

    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (account, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id",
      [account, hash, nickname]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET as string
    );

    res.json({
      id: result.rows[0].id,
      account,
      nickname,
      token,
    });
  } catch (error) {
    console.error("[Register] error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

export default router;
