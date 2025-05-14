// backend/src/routes/auth.ts

import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

router.post("/api/auth/register", async (req: Request, res: Response) => {
  const { account, password, nickname } = req.body;

  if (!account || !password || !nickname) {
    res.status(400).json({ message: "請填寫帳號、密碼與暱稱" });
    return;
  }

  try {
    // 檢查是否已註冊
    const existingUser = await prisma.user.findUnique({
      where: { account },
    });

    if (existingUser) {
      res.status(409).json({ message: "此帳號已被註冊" });
      return;
    }

    // 密碼加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 建立新用戶
    const user = await prisma.user.create({
      data: {
        account,
        passwordHash,
        nickname,
      },
    });

    // 產生 JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    console.log(`token: ${token}`);
    res.status(201).json({
      id: user.id,
      account: user.account,
      nickname: user.nickname,
      token,
    });
  } catch (error) {
    console.error("[Register] error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

export default router;
