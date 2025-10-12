// backend/src/services/UserService.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  UserExistsError,
  UserNotFoundError,
  InvalidPasswordError,
  InvalidTokenError,
  ExpiredTokenError,
} from "../errors/AppError.ts";

export default class UserService {
  constructor(private prisma: PrismaClient) {}

  async register(account: string, password: string, nickname: string) {
    // 檢查帳號是否存在
    const existing = await this.prisma.user.findUnique({ where: { account } });
    if (existing) throw new UserExistsError();

    // 密碼加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 建立用戶
    return this.prisma.user.create({
      data: { account, passwordHash, nickname },
    });
  }

  async getById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, account: true, nickname: true },
    });
  }

  async login(account: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { account } });
    if (!user) throw new UserNotFoundError();

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (isValid) {
      return user;
    } else {
      throw new InvalidPasswordError();
    }
  }

  sign(userId: number) {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
  }

  verify(token: string): { userId: number } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: number;
      };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ExpiredTokenError();
      }
      throw new InvalidTokenError();
    }
  }
}
