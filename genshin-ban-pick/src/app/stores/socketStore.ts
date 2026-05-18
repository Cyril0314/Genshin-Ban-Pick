// src/app/stores/socket.ts
// 建立 Socket 實例

import { SocketNotConnected } from '@/app/errors/AppError';
import { defineStore } from 'pinia';
import { io, type Socket } from 'socket.io-client';
import { computed, ref } from 'vue';

import { createLogger } from '@/app/utils/logger';

const logger = createLogger('app.socket');

export const useSocketStore = defineStore('socket', () => {
    const socket = ref<Socket>();
    const connected = computed(() => socket.value?.connected ?? false);

    function connect(token: string) {
        logger.info('connecting');
        if (socket.value?.connected) {
            logger.warn('already connected');
            return;
        }
        // 空字串 / 未設 → undefined → socket.io 連 page origin
        const baseURL = import.meta.env.VITE_SOCKET_URL || undefined;
        socket.value = io(baseURL, { auth: { token } });

        socket.value.on('connect', () => {
            logger.info('connected id=' + socket.value!.id);
        });

        socket.value.on('disconnect', () => {
            logger.warn('disconnected');
        });

        socket.value.on('connect_error', (err) => {
            logger.error('connect error:', err.message);
        });

        socket.value.onAny((event, ...args) => {
            logger.debug('event:', event, args);
        });
    }

    function disconnect() {
        logger.info('disconnecting');
        if (!socket.value || socket.value.disconnected) {
            logger.warn('already disconnected');
            return;
        }
        socket.value?.disconnect();
    }

    function getSocket(): Socket {
        if (!socket.value) throw new SocketNotConnected();
        return socket.value as Socket;
    }

    return {
        socket,
        connected,
        connect,
        disconnect,
        getSocket,
    };
});
