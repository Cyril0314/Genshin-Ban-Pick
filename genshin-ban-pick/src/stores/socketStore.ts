// src/network/socket.ts
// 建立 Socket 實例

import { SocketNotConnected } from '@/errors/AppError';
import { defineStore } from 'pinia';
import { io, type Socket } from 'socket.io-client';
import { ref } from 'vue';

export const useSocketStore = defineStore('socket', () => {
    const socket = ref<Socket | null>(null);

    function connect(token?: string, guestId?: string) {
        console.info(`[SOCKET] Connecting`);
        if (socket.value?.connected) {
            console.warn(`[SOCKET] Has Connected`);
            return;
        }

        const baseURL = import.meta.env.VITE_SOCKET_URL;

        socket.value = io(baseURL, {
            auth: token ? { token } : { guestId },
        });

        socket.value.on('connect', () => {
            console.info('[SOCKET] Connected:', socket.value!.id);
        });

        socket.value.on('disconnect', () => {
            console.warn('[SOCKET] Disconnected');
        });

        socket.value.on('connect_error', (err) => {
            console.error('[SOCKET] Connect Error:', err.message);
            // 例如跳回 /login 或顯示錯誤訊息：
            // router.push("/login")
        });

        socket.value.onAny((event, ...args) => {
            console.debug('[SOCKET] emit:', event, args);
        });
    }

    function getSocket(): Socket {
        if (!socket.value) throw new SocketNotConnected();
        return socket.value as Socket;
    }

    return {
        socket,
        connect,
        getSocket,
    };
});
