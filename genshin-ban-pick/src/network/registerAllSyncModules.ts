// src/network/registerAllSyncModules.ts

import { useBoardSync } from '@/features/BanPick/composables/useBoardSync';
import { useChatSync } from '@/features/ChatRoom/composables/useChatSync';
import { useRoomUserSync } from '@/modules/room/sync/useRoomUserSync';
import { useMatchStepSync } from '@/modules/board/sync/useMatchStepSync';
import { useTacticalBoardSync } from '@/features/Tactical/composables/useTacticalBoardSync';
import { useTeamInfoSync } from '@/features/Team/composables/useTeamInfoSync';
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
