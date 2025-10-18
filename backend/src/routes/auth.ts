// backend/src/routes/auth.ts

import express, { Request, Response } from "express";

import {
  MissingFieldsError,
  UserNotFoundError,
  InvalidTokenError,
} from "../errors/AppError.ts";
import UserService from "../services/UserService.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export default function authRoutes(userService: UserService) {
  const router = express.Router();

  router.post(
    "/auth/register",
    asyncHandler(async (req: Request, res: Response) => {
      const { account, password, nickname } = req.body;
      if (!account || !password || !nickname) {
        throw new MissingFieldsError();
      }
      const user = await userService.register(account, password, nickname);
      const token = userService.sign(user.id);
      res.status(201).json({
        id: user.id,
        account: user.account,
        nickname: user.nickname,
        token,
      });
    })
  );

  router.post(
    "/auth/login",
    asyncHandler(async (req: Request, res: Response) => {
      const { account, password } = req.body;
      if (!account || !password) {
        throw new MissingFieldsError();
      }
      const user = await userService.login(account, password);
      const token = userService.sign(user.id);

      res.status(200).json({
        id: user.id,
        account: user.account,
        nickname: user.nickname,
        token,
      });
    })
  );

  router.get(
    "/auth/me",
    asyncHandler(async (req: Request, res: Response) => {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        throw new InvalidTokenError();
      }

      const token = authHeader.split(" ")[1];
      const payload = userService.verify(token);
      const user = await userService.getById(payload.userId);
      if (!user) {
        throw new UserNotFoundError();
      }

      res.status(200).json(user);
    })
  );

  return router;
}
