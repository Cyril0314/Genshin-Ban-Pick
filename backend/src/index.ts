// backend/src/index.js

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { createLogger } from './utils/logger.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import authRoutes from './routes/auth.ts';
import characterRoutes from './routes/characters.ts';
import roomRoutes from './routes/room.ts';
import CharacterService from './services/CharacterService.ts';
import RoomService from './services/RoomService.ts';
import UserService from './services/UserService.ts';
import { createSocketApp } from './socket/index.ts';

import type { Request, Response } from 'express';

const logger = createLogger('INDEX')

// ---------------------------------------------------------
// 🧩 4. 環境變數設定
// ---------------------------------------------------------
logger.info('Configure Environment');
dotenv.config();

// ---------------------------------------------------------
// 🧩 5. 應用程式初始化
// ---------------------------------------------------------
logger.info('Init App');
const app = express();
const server = http.createServer(app);
app.use(
    cors({
        origin: ['http://localhost:5173', 'http://52.87.171.134:3000'], // ✅ 允許來源
        credentials: true, // ✅ 若要傳 cookie 或 token
    }),
);

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
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.json());

// ---------------------------------------------------------
// 🧩 6. Service 實例化
// ---------------------------------------------------------
logger.info('Init Services');
const prisma = new PrismaClient();
const userService = new UserService(prisma);
const roomService = new RoomService();
const characterService = new CharacterService();

// ---------------------------------------------------------
// 🧩 7. Routes 註冊
// ---------------------------------------------------------
logger.info('Register Api Routes');
app.use('/api', authRoutes(userService));
app.use('/api', roomRoutes(roomService));
app.use('/api', characterRoutes(characterService));

app.use('/api', authRoutes(userService));
app.use('/api', characterRoutes(characterService));
app.use('/api', roomRoutes(roomService));

// ---------------------------------------------------------
// 🧩 8. Socket 初始化
// ---------------------------------------------------------
logger.info('Init Socket');
createSocketApp(server, prisma);

// ---------------------------------------------------------
// 🧩 9. Error Handler (一定要最後)
// ---------------------------------------------------------
app.use(errorHandler);

// 讓所有未知的 request 都回傳 index.html (支援 Vue Router history mode)
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

(async () => {
    logger.debug('[Prisma] DATABASE_URL =', process.env.DATABASE_URL);

    const info = await prisma.$queryRawUnsafe<{ current_database: string; current_schema: string }[]>(`SELECT current_database(), current_schema()`);
    logger.debug('[Prisma] connected to:', info);
})();

process.on('uncaughtException', (err) => {
    logger.error('[uncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
    logger.error('[unhandledRejection]', reason);
});

// ---------------------------------------------------------
// 🧩 10. Server 啟動
// ---------------------------------------------------------
server.listen(3000, '0.0.0.0', () => {
    logger.info('Server is running on http://localhost:3000');
});
