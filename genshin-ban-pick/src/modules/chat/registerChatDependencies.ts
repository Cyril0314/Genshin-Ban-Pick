// src/modules/chat/registerChatDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import ChatUseCase from './application/ChatUseCase';

import type { App } from 'vue';
import type { useChatStore } from './store/chatStore';

export function registerChatDependencies(app: App, chatStore: ReturnType<typeof useChatStore>) {
    const chatUseCase = new ChatUseCase(chatStore);
    app.provide(DIKeys.ChatUseCase, chatUseCase);
}
