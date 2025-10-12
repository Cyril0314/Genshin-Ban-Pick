// backend/src/socket/socketAuth.ts

import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";

export function createSocketAuth(prisma: PrismaClient) {
  return function attachAuthMiddleware(io: Server) {
    io.use(async (socket: Socket, next) => {
      const { token, guestId } = socket.handshake.auth as {
        token?: string;
        guestId?: string;
      };

      if (token) {
        // 1. 會員身份：驗證 JWT
        try {
          const payload = jwt.verify(
            token,
            process.env.JWT_SECRET as string
          ) as {
            userId: number;
          };
          socket.data.userId = payload.userId;

          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, nickname: true },
          });
          if (!user) {
            return next(new Error("Unauthorized: User not found"));
          }
          socket.data.userId = user.id;
          socket.data.nickname = user.nickname;
          socket.data.isGuest = false;
          socket.data.identityKey = `user:${user.id}`;

          console.log(`[Auth] Verified user: ${user.nickname} (id=${user.id})`);
          return next();
        } catch (err) {
          return next(new Error("Unauthorized: Invalid token"));
        }
      }

      if (guestId) {
        // 2. 訪客身份：可以先驗證格式，或直接接受
        if (!/^guest_[0-9a-zA-Z]{6}$/.test(guestId)) {
          return next(new Error("Unauthorized: Invalid guestId"));
        }
        socket.data.guestId = guestId;
        socket.data.nickname = guestId;
        socket.data.isGuest = true;
        socket.data.identityKey = `guest:${guestId}`;

        console.log(`[Auth] Guest connected: ${guestId}`);
        return next();
      }

      // 3. 既沒 token 也沒 guestId → 拒絕連線
      return next(new Error("Unauthorized: No credentials supplied"));
    });
  };
}
