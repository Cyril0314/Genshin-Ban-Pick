// backend/src/socket/modules/chatSocket.ts

import { Server, Socket } from "socket.io";

import { createLogger } from '../../../utils/logger.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';

const logger = createLogger('CHAT SOCKET')

enum ChatEvent {
    MessageSendRequest = 'chat.message.send.request',
    MessageSendBroadcast = 'chat.message.send.broadcast',

    MessagesStateRequest = 'chat.messages.state.request',
    MessagesStateSyncSelf = 'chat.messages.state.sync.self',
}

export function registerChatSocket(io: Server, socket: Socket, roomStateManager: IRoomStateManager) {
  socket.on(
    `${ChatEvent.MessageSendRequest}`, ({ message }: { message: string }) => {
      logger.info(`Received ${ChatEvent.MessageSendRequest} message: ${message}`);
      const roomId = (socket as any).roomId;
      if (!roomId || !message) return;

      
      const roomState = roomStateManager.get(roomId);
      if (!roomState) return;

      const identityKey = socket.data.identity.identityKey as string;
      const nickname = socket.data.identity.nickname as string;
      const newMsg = { identityKey, nickname, message, timestamp: Date.now() };
      roomState.chatMessages.push(newMsg);

      socket.to(roomId).emit(`${ChatEvent.MessageSendBroadcast}`, newMsg);
      logger.info(`Sent ${ChatEvent.MessageSendBroadcast} newMsg: ${newMsg}`);
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
