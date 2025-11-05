// backend/src/prisma.ts

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // optional: 開 log 方便 debug
  });

// 在開發環境避免 hot-reload 重複 new PrismaClient
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;