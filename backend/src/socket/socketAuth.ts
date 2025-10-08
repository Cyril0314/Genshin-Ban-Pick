// backend/src/socket/socketAuth.ts

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

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
          const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: number;
          };
          socket.data.userId = payload.userId;
  
          // 1.1 從資料庫取暱稱
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { nickname: true },
          });
          if (!user) {
            return next(new Error("Unauthorized: User not found"));
          }
          socket.data.nickname = user.nickname;
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
  
        // 2.1 決定訪客顯示名稱：直接使用 guestId 當 default
        const clientGuestName = guestId;
        socket.data.nickname = clientGuestName;
  
        return next();
      }
  
      // 3. 既沒 token 也沒 guestId → 拒絕連線
      return next(new Error("Unauthorized: No credentials supplied"));
    });
  }
}