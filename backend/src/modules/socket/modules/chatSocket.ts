// backend/src/modules/socket/modules/chatSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';
import { ChatEvent } from '@shared/contracts/chat/value-types';
import { ChatService } from '../../chat';

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

const logger = createLogger('socket.chat');

export function registerChatSocket(io: Server, socket: Socket, chatService: ChatService) {
    socket.on(`${ChatEvent.MessageSendRequest}`, ({ message }: { message: IChatMessage }) => {
        logger.debug(`Received ${ChatEvent.MessageSendRequest} message: ${message}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        chatService.add(roomId, message);
        socket.to(roomId).emit(`${ChatEvent.MessageSendBroadcast}`, message);
        logger.debug(`Sent ${ChatEvent.MessageSendBroadcast}`, message);
    });

    socket.on(`${ChatEvent.MessagesStateRequest}`, () => {
        logger.debug(`Received ${ChatEvent.MessagesStateRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const chatMessages = chatService.getChatMessages(roomId);
        socket.emit(`${ChatEvent.MessagesStateSyncSelf}`, chatMessages);
        logger.debug(`Sent ${ChatEvent.MessagesStateSyncSelf} chatMessages:`, chatMessages);
    });
}
