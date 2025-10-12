// backend/src/socket/index.ts

import http from "http";

import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

import { createSocketAuth } from "./socketAuth.ts";
import { setupSocketIO } from "./socketController.ts";

export function createSocketApp(server: http.Server, prisma: PrismaClient) {
  const io = new Server(server, {
    cors: {
      // origin: ["http://localhost:5173", "http://52.87.171.134"], // 允許的前端來源
      origin: ["http://localhost:5173", "http://52.87.171.134:3000"], // 允許的前端來源
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const attachAuth = createSocketAuth(prisma); // 建立 middleware
  attachAuth(io); // 連接 middleware 和 io
  setupSocketIO(io); // 設定 io
  return io;
}
