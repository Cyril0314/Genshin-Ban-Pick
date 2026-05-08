# syntax=docker/dockerfile:1.6

# ---------------------------------------------------------------
# Stage 1: builder — install deps, build frontend + backend
# ---------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# 強制 npm 用 IPv4 解析 — EC2 等沒有 IPv6 routing 的環境會 hang on DNS
ENV NODE_OPTIONS=--dns-result-order=ipv4first

# shared 是兩端都會 import 的型別合約，先放進去
COPY shared ./shared

# Frontend: install deps → build (Vite outDir 已設定為 ../backend/public)
COPY genshin-ban-pick/package*.json ./genshin-ban-pick/
RUN cd genshin-ban-pick && npm ci
COPY genshin-ban-pick ./genshin-ban-pick
RUN cd genshin-ban-pick && npm run build

# Backend: install deps → prisma generate → tsup build
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend ./backend
RUN cd backend && npx prisma generate && npm run build

# ---------------------------------------------------------------
# Stage 2: runtime — 只帶執行期需要的東西
# ---------------------------------------------------------------
FROM node:22-alpine
WORKDIR /app

# 安裝完整 deps（保留 prisma CLI 給 migrate deploy 用）
COPY backend/package*.json ./
RUN npm ci

# 從 builder 拿 build 產物 + 前端靜態檔 + Prisma schema
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/public ./public

# 對 runtime node_modules 重新產 Prisma client
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000

# 啟動前先套用 migrations，再起服
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
