// backend/src/modules/chat/application/chat.service.ts

import { addMessage } from '../domain/addMessage';

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';
import type { IRoomStateRepository } from '../../room';

export default class ChatService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    add(roomId: string, message: IChatMessage) {
        const prevChatMessages = this.roomStateRepository.findChatMessagesById(roomId);
        const nextChatMessages = addMessage(prevChatMessages, message)
        this.roomStateRepository.updateChatMessagesById(roomId, nextChatMessages);
    }

    getChatMessages(roomId: string) {
        return this.roomStateRepository.findChatMessagesById(roomId);
    }
}
