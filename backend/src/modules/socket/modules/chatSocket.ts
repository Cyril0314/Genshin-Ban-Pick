// backend/src/modules/socket/modules/chatSocket.ts

import { Server, Socket } from "socket.io";

import { createLogger } from '../../../utils/logger';

import type { IRoomStateManager } from '../domain/IRoomStateManager';
import type { IChatMessage } from "@shared/contracts/chat/IChatMessage";

const logger = createLogger('CHAT SOCKET')

enum ChatEvent {
    MessageSendRequest = 'chat.message.send.request',
    MessageSendBroadcast = 'chat.message.send.broadcast',

    MessagesStateRequest = 'chat.messages.state.request',
    MessagesStateSyncSelf = 'chat.messages.state.sync.self',
}

export function registerChatSocket(io: Server, socket: Socket, roomStateManager: IRoomStateManager) {
  socket.on(
    `${ChatEvent.MessageSendRequest}`, ({ message }: { message: IChatMessage }) => {
      logger.info(`Received ${ChatEvent.MessageSendRequest} message: ${message}`);
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      const roomState = roomStateManager.get(roomId);
      if (!roomState) return;

      roomState.chatMessages.push(message);

      socket.to(roomId).emit(`${ChatEvent.MessageSendBroadcast}`, message);
      logger.info(`Sent ${ChatEvent.MessageSendBroadcast}`, message);
    }
  );

  socket.on(
    `${ChatEvent.MessagesStateRequest}`, () => {
      logger.info(`Received ${ChatEvent.MessagesStateRequest}`);
      const roomId = (socket as any).roomId;
      syncChatMessagesStateSelf(socket, roomId, roomStateManager)
    }
  );
}

export function syncChatMessagesStateSelf(socket: Socket, roomId: string, roomStateManager: IRoomStateManager) {
    const chatMessages = roomStateManager.getChatMessages(roomId);
    socket.emit(`${ChatEvent.MessagesStateSyncSelf}`, chatMessages);
    logger.info(`Sent ${ChatEvent.MessagesStateSyncSelf} chatMessages: ${JSON.stringify(chatMessages, null, 2)}`);
}
