// backend/src/socketController.ts

import { Server, Socket } from "socket.io";
import { attachAuthMiddleware } from "./socket/socketAuth.ts";
import jwt from "jsonwebtoken";
import {
  advanceStep,
  rollbackStep,
  resetStep,
  getCurrentStep,
} from "./banPickFlow.ts";
import { PrismaClient } from "@prisma/client";

type RoomId = string;
type ImageMap = Record<string, string>;
type Team = "aether" | "lumine";

interface ChatItem {
  senderName: string;
  message: string;
  timestamp: number;
}

export const imageState: Record<RoomId, Record<string, string>> = {};
export const teamMembersState: Record<RoomId, Record<Team, string>> = {};
const chatHistory: Record<RoomId, ChatItem[]> = {};

export function setupSocketIO(io: Server) {
  attachAuthMiddleware(io);

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    console.log(`[SocketIO] ${socket.id} authenticated as`, {
      userId: socket.data.userId ?? null,
      guestId: socket.data.guestId ?? null,
    });

    socket.on("room.join.request", (roomId: string) => {
      console.log(`[Server] ${socket.id} joined room: ${roomId}`);
      socket.join(roomId);
      (socket as any).roomId = roomId;

      if (!imageState[roomId]) imageState[roomId] = {};
      if (!teamMembersState[roomId])
        teamMembersState[roomId] = { aether: "", lumine: "" };
      if (!chatHistory[roomId]) chatHistory[roomId] = [];

      socket.emit("image.state.sync", imageState[roomId]);
      socket.emit("team.members.state.sync", teamMembersState[roomId]);
      socket.emit("step.state.sync", getCurrentStep(roomId));
      socket.emit("chat.history.sync", chatHistory[roomId]);
    });

    socket.on(
      "image.drop.request",
      ({
        imgId,
        zoneId,
        senderId,
      }: {
        imgId: string;
        zoneId: string;
        senderId: string;
      }) => {
        const who = socket.data.userId ?? socket.data.guestId;
        console.log(`[Socket] image.drop.request from:`, who);

        const roomId = (socket as any).roomId;
        if (!roomId) return;

        imageState[roomId][zoneId] = imgId;
        socket
          .to(roomId)
          .emit("image.drop.broadcast", { imgId, zoneId, senderId });
      }
    );

    socket.on(
      "image.restore.request",
      ({ zoneId, senderId }: { zoneId: string; senderId: string }) => {
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        delete imageState[roomId][zoneId];
        socket.to(roomId).emit("image.restore.broadcast", { zoneId, senderId });
      }
    );

    socket.on("image.reset.request", ({ senderId }: { senderId: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      imageState[roomId] = {};
      socket.to(roomId).emit("image.reset.broadcast", { senderId });
    });

    socket.on("step.advance.request", ({ senderId }: { senderId: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;
      advanceStep(io, roomId);
    });

    socket.on("step.rollback.request", ({ senderId }: { senderId: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;
      rollbackStep(io, roomId);
    });

    socket.on("step.reset.request", ({ senderId }: { senderId: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;
      resetStep(io, roomId);
    });

    socket.on(
      "team.members.update.request",
      ({
        team,
        content,
        senderId,
      }: {
        team: Team;
        content: string;
        senderId: string;
      }) => {
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        if (!teamMembersState[roomId]) {
          teamMembersState[roomId] = { aether: "", lumine: "" };
        }

        teamMembersState[roomId][team] = content;
        socket.to(roomId).emit("team.members.update.broadcast", {
          team,
          content,
          senderId,
        });
      }
    );

    socket.on(
      "chat.message.send.request",
      ({ message, senderId }: { message: string; senderId: string }) => {
        const roomId = (socket as any).roomId;
        if (!roomId || !message) return;

        const senderName = socket.data.nickname as string;

        if (!chatHistory[roomId]) chatHistory[roomId] = [];
        chatHistory[roomId].push({
          senderName,
          message,
          timestamp: Date.now(),
        });

        io.to(roomId).emit("chat.message.send.broadcast", {
          senderName,
          message,
          timestamp: Date.now(),
          senderId,
        });
      }
    );
  });
}
