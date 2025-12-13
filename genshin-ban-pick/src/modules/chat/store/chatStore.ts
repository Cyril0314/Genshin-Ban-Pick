// src/modules/chat/store/chatStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export const useChatStore = defineStore('chat', () => {
    const messages = ref<IChatMessage[]>([]);

    const hasUnreadMessage = ref(false);

    function setMessages(newMessages: IChatMessage[]) {
        console.debug(`[CHAT STORE] Set new messages`, newMessages);
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
