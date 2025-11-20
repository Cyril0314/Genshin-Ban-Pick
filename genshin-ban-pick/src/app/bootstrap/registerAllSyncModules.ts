// src/app/bootstrap/registerAllSyncModules.ts

import { useBoardSync, useMatchStepSync } from '@/modules/board';
import { useChatSync } from '@/modules/chat';
import { useRoomUserSync } from '@/modules/room';
import { useTacticalBoardSync } from '@/modules/tactical';
import { useTeamInfoSync } from '@/modules/team';
import type { Socket } from 'socket.io-client';

const SOCKET_BOUND_FLAG = Symbol('socket-sync-bound');

export function registerAllSyncModules(socket: Socket) {
    if ((socket as any)[SOCKET_BOUND_FLAG]) return;
    (socket as any)[SOCKET_BOUND_FLAG] = true;

    const { registerRoomUserSync } = useRoomUserSync();
    const { registerTeamInfoSync } = useTeamInfoSync();
    const { registerBoardSync } = useBoardSync();
    const { registerMatchStepSync } = useMatchStepSync();
    const { registerTacticalBoardSync } = useTacticalBoardSync();
    const { registerChatSync } = useChatSync();

    registerRoomUserSync();
    registerTeamInfoSync();
    registerBoardSync();
    registerMatchStepSync();
    registerTacticalBoardSync();
    registerChatSync();

    console.debug('[SOCKET SYNC] ✅ All sync modules registered');
}
