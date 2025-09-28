// backend/src/routes/auth.ts

import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();
const verify = jwt.verify;


const tables = await prisma.$queryRawUnsafe(`SELECT current_database(), current_schema()`);
console.log("[Prisma] connected to:", tables);

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

router.post("/api/auth/login", async (req: Request, res: Response) => {
  const { account, password } = req.body;
  console.log(`account`, account);
  console.log(`password`, password);
  if (!account || !password) {
    res.status(400).json({ message: "請輸入帳號與密碼" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { account } });
    console.log(`user`, user);
    if (!user) {
      res.status(404).json({ message: "帳號不存在" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log(`isPasswordValid`, isPasswordValid);
    if (!isPasswordValid) {
      res.status(401).json({ message: "密碼錯誤" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      id: user.id,
      account: user.account,
      nickname: user.nickname,
      token,
    });
  } catch (error) {
    console.error("[Login] error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/api/auth/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "缺少或格式錯誤的 Authorization 標頭" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        account: true,
        nickname: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "找不到使用者" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error("[Auth] token 驗證失敗", err);
    res.status(401).json({ message: "無效或過期的 token" });
  }
});

export default router;
