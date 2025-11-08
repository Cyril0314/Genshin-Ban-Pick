// src/stores/chatStore.ts

import type { IChatMessage } from '@/types/IChatMessage';
import { defineStore } from 'pinia';
import { ref } from 'vue';


export const useChatStore = defineStore('chat', () => {
    const messages = ref<IChatMessage[]>([]);

    function setMessages(newMessages: IChatMessage[]) {
            console.debug(`[CHAT STORE] Set new messages`, newMessages);
            messages.value = newMessages;
    }
    
    function addMessage(message: IChatMessage) {
        console.debug(`[CHAT STORE] Add message`, message);
        messages.value.push(message);
    }

    return {
        messages,
        addMessage,
        setMessages
    }
})