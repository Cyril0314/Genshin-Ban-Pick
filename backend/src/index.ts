// backend/src/index.ts

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';

import { createLogger } from './utils/logger';
import { accessLog } from './middlewares/accessLog';
import { errorHandler } from './middlewares/errorHandler';
import { registerAppRouters } from './app/appRouter';
import { createSocketApp } from './modules/socket/index';
import RoomStateManager from './modules/socket/infra/RoomStateManager';
import AuthValidator from './modules/socket/infra/AuthValidator';

import type { Request, Response } from 'express';

const logger = createLogger('app.bootstrap');

// ---------------------------------------------------------
// 🧩 4. 應用程式初始化
//   env 來源:
//   - dev/start: --env-file=../.env (Node 22+)
//   - docker:    docker-compose.yml 的 environment 直接灌進 process.env
// ---------------------------------------------------------
// ---------------------------------------------------------
logger.info('Init App');
const app = express();
const server = http.createServer(app);

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: corsOrigins,
        credentials: true,
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
app.use(accessLog);
// app.disable('etag');
// ---------------------------------------------------------
// 🧩 6. 資料服務實例化
// ---------------------------------------------------------
logger.info('Init Services');
const prisma = new PrismaClient(); // DB
const roomStateManager = new RoomStateManager(); // Disk

// ---------------------------------------------------------
// 🧩 7. Routes 註冊
// ---------------------------------------------------------
logger.info('Register Api Routes');
const modules = registerAppRouters(app, prisma, roomStateManager);

// ---------------------------------------------------------
// 🧩 8. Socket 初始化
// ---------------------------------------------------------
logger.info('Init Socket');
const authValidator = new AuthValidator(modules.authModule.authService)
createSocketApp(server, roomStateManager, authValidator);

// ---------------------------------------------------------
// 🧩 9. Error Handler (一定要最後)
// ---------------------------------------------------------
app.use(errorHandler);

// 讓所有未知的 request 都回傳 index.html (支援 Vue Router history mode)
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

(async () => {
    const info = await prisma.$queryRawUnsafe<{ current_database: string; current_schema: string }[]>(`SELECT current_database(), current_schema()`);
    const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : 'unknown';
    logger.info(`db connected host=${dbHost} database=${info[0].current_database} schema=${info[0].current_schema}`);
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
    logger.info(
        `ready port=3000 cors=[${corsOrigins.join(',')}] level=${process.env.LOG_LEVEL ?? 'debug'} node_env=${process.env.NODE_ENV ?? 'development'}`,
    );
});
