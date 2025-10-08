// backend/src/socket/modules/chatSocket.ts

import { Server, Socket } from "socket.io";

interface ChatItem {
  senderName: string;
  message: string;
  timestamp: number;
}
type RoomId = string;

export const chatHistory: Record<RoomId, ChatItem[]> = {};

export function registerChatSocket(io: Server, socket: Socket) {
  socket.on(
    "chat.message.send.request",
    ({ message, senderId }: { message: string; senderId: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId || !message) return;

      const senderName = socket.data.nickname as string;
      chatHistory[roomId] ||= [];
      const newMsg = { senderName, message, timestamp: Date.now() };
      chatHistory[roomId].push(newMsg);

      io.to(roomId).emit("chat.message.send.broadcast", {
        ...newMsg,
        senderId,
      });
    }
  );
}

export function syncChatState(socket: Socket, roomId: RoomId) {
    if (!chatHistory[roomId]) chatHistory[roomId] = [];
    console.log("syncChatState");
    socket.emit("chat.history.sync", chatHistory[roomId]);
}
