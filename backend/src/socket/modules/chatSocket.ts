// backend/src/socket/modules/chatSocket.ts

import { Server, Socket } from "socket.io";

import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from "../managers/RoomStateManager.ts";

const logger = createLogger('CHAT SOCKET')

enum SocketEvent {
    CHAT_MESSAGE_SEND_REQUEST = 'chat.message.send.request',
    CHAT_MESSAGE_SEND_BROADCAST = 'chat.message.send.broadcast',

    CHAT_MESSAGES_STATE_REQUEST = 'chat.messages.state.request',
    CHAT_MESSAGES_STATE_SYNC_SELF = 'chat.messages.state.sync.self',
}

export function registerChatSocket(io: Server, socket: Socket, roomStateManager: RoomStateManager) {
  socket.on(
    `${SocketEvent.CHAT_MESSAGE_SEND_REQUEST}`, ({ message }: { message: string }) => {
      logger.info(`Received ${SocketEvent.CHAT_MESSAGE_SEND_REQUEST} message: ${message}`);
      const roomId = (socket as any).roomId;
      if (!roomId || !message) return;

      const identityKey = socket.data.identityKey;
      const roomState = roomStateManager.ensure(roomId);
      const nickname = socket.data.nickname as string;
      const newMsg = { identityKey, nickname, message, timestamp: Date.now() };
      roomState.chatMessages.push(newMsg);

      socket.to(roomId).emit(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`, newMsg);
      logger.info(`Sent ${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST} newMsg: ${newMsg}`);
    }
  );

  socket.on(
    `${SocketEvent.CHAT_MESSAGES_STATE_REQUEST}`, () => {
      logger.info(`Received ${SocketEvent.CHAT_MESSAGES_STATE_REQUEST}`);
      const roomId = (socket as any).roomId;
      syncChatMessagesStateSelf(socket, roomId, roomStateManager)
    }
  );
}

export function syncChatMessagesStateSelf(socket: Socket, roomId: string, roomStateManager: RoomStateManager) {
    const chatMessages = roomStateManager.getChatMessages(roomId);
    socket.emit(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC_SELF}`, chatMessages);
    logger.info(`Sent ${SocketEvent.CHAT_MESSAGES_STATE_SYNC_SELF} chatMessages: ${JSON.stringify(chatMessages, null, 2)}`);
}
