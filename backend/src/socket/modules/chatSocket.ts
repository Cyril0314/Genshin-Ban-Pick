// backend/src/socket/modules/chatSocket.ts

import { Server, Socket } from "socket.io";

import { logger } from '../../utils/logger.ts';

enum SocketEvent {
    CHAT_MESSAGE_SEND_REQUEST = 'chat.message.send.request',
    CHAT_MESSAGE_SEND_BROADCAST = 'chat.message.send.broadcast',

    CHAT_MESSAGES_STATE_SYNC = 'chat.messages.state.sync',
}

interface IChatItem {
  senderName: string;
  message: string;
  timestamp: number;
}
type RoomId = string;

export const chatMessagesState: Record<RoomId, IChatItem[]> = {};

export function registerChatSocket(io: Server, socket: Socket) {
  socket.on(
    `${SocketEvent.CHAT_MESSAGE_SEND_REQUEST}`,
    ({ message, senderId }: { message: string; senderId: string }) => {
      logger.info(`Received ${SocketEvent.CHAT_MESSAGE_SEND_REQUEST} message: ${message} senderId: ${senderId}`);
      const roomId = (socket as any).roomId;
      if (!roomId || !message) return;

      const senderName = socket.data.nickname as string;
      chatMessagesState[roomId] ||= [];
      const newMsg = { senderName, message, timestamp: Date.now() };
      chatMessagesState[roomId].push(newMsg);

      socket.to(roomId).emit(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`, {
        ...newMsg,
        senderId,
      });
      logger.info(`Sent ${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST} newMsg: ${newMsg} senderId: ${senderId}`);
    }
  );
}

export function syncChatState(socket: Socket, roomId: RoomId) {
    const chatMessages = chatMessagesState[roomId] || []
    socket.emit(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC}`, chatMessages);
    logger.info(`Sent ${SocketEvent.CHAT_MESSAGES_STATE_SYNC} chatMessages: ${JSON.stringify(chatMessages, null, 2)}`);
}
