// src/modules/chat/ui/composables/useChatWindow.ts


import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useChatStore } from '@/modules/chat/store/chatStore';
import { useChatUseCase } from '@/modules/chat';

export function useChatWindow() {
    const chatStore = useChatStore();
    const chatUseCase = useChatUseCase();

    const { messages, hasUnreadMessage } = storeToRefs(chatStore);

    const isChatOpen = ref(false);

    // 當訊息變動，且視窗未開啟 → 設定 unread
    watch(
        () => messages.value,
        () => {
            if (!isChatOpen.value) {
                chatUseCase.setHasUnreadMessage(true);
            }
        },
        { deep: true },
    );

    // 視窗開啟 → 清除 unread
    watch(isChatOpen, (newVal) => {
        if (newVal) {
            chatUseCase.setHasUnreadMessage(false);
        }
    });

    function toggleChatWindow() {
        isChatOpen.value = !isChatOpen.value;
    }

    return {
        isChatOpen,
        hasUnreadMessage,
        toggleChatWindow,
    };
}
