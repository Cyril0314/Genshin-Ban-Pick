// backend/src/index.js

import express from "express";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import { setupSocketIO } from "./socketController.ts";
import authRoutes from "./routes/auth.ts";
import characterRoutes from "./routes/characters.ts";
import roomRoutes from "./routes/room.ts";
import recordRoutes from "./routes/record.ts";
import { AppError } from "./errors/AppError.ts"
import path from "path";

import http from "http";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { UserService } from "./services/UserService.ts";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const userService = new UserService(prisma)

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
});

(async () => {
  console.log("[Prisma] DATABASE_URL =", process.env.DATABASE_URL);

  const info = await prisma.$queryRawUnsafe<
    { current_database: string; current_schema: string }[]
  >(`SELECT current_database(), current_schema()`);
  console.log("[Prisma] connected to:", info);
})();

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://52.87.171.134:3000"], // ✅ 允許來源
    credentials: true, // ✅ 若要傳 cookie 或 token
  })
);
const io = new Server(server, {
  cors: {
    // origin: ["http://localhost:5173", "http://52.87.171.134"], // 允許的前端來源
    origin: ["http://localhost:5173", "http://52.87.171.134:3000"], // 允許的前端來源
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocketIO(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 靜態文件服務
// app.use(
//   express.static(path.join(__dirname, "../"), {
//     setHeaders: function (res, path) {
//       if (path.endsWith(".js")) {
//         // 設定 JavaScript 文件的正確 MIME 類型
//         res.set("Content-Type", "application/javascript");
//       }
//     },
//   })
// );

// Express 提供前端的靜態檔案 (非常重要!)
app.use(express.static(path.resolve(__dirname, "../public")));
app.use(express.json())

app.use("/api/auth", authRoutes(userService));
app.use(characterRoutes);
app.use(roomRoutes);
app.use(recordRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    console.error("[AppError]", err);
    res.status(err.statusCode).json({ code: err.code, message: err.message });
  } else {
    console.error("[Unexpected Error]", err);
    res.status(500).json({ code: "INTERNAL_ERROR", message: "伺服器錯誤" });
  }
});

// 讓所有未知的 request 都回傳 index.html (支援 Vue Router history mode)
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, "../public/index.html"));
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://localhost:3000");
});
