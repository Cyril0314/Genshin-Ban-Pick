// src/modules/chat/store/chatStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export const useChatStore = defineStore('chat', () => {
    const messages = ref<IChatMessage[]>([]);

    function setMessages(newMessages: IChatMessage[]) {
            console.debug(`[CHAT STORE] Set new messages`, newMessages);
            messages.value = newMessages;
    }

    return {
        messages,
        setMessages
    }
})