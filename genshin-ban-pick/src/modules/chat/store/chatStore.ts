// src/modules/chat/store/chatStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';

import { createLogger } from '@/app/utils/logger';

const logger = createLogger('chat.store');

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export const useChatStore = defineStore('chat', () => {
    const messages = ref<IChatMessage[]>([]);

    const hasUnreadMessage = ref(false);

    function setMessages(newMessages: IChatMessage[]) {
        logger.debug('set messages', newMessages);
        messages.value = newMessages;
    }

    function setHasUnreadMessage(hasUnread: boolean) {
        hasUnreadMessage.value = hasUnread;
    }

    return {
        messages,
        hasUnreadMessage,
        setMessages,
        setHasUnreadMessage,
    };
});
