// src/modules/room/sync/useRoomUserSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { createLogger } from '@/app/utils/logger';
import { RoomEvent } from '@shared/contracts/room/value-types';
import { useRoomUserUseCase } from '../ui/composables/useRoomUserUseCase';

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

const logger = createLogger('room.sync');

export function useRoomUserSync() {
    const roomUserUseCase = useRoomUserUseCase();
    const socket = useSocketStore().getSocket();

    function registerRoomUserSync() {
        socket.on(`${RoomEvent.UserJoinBroadcast}`, handleRoomUserJoinBroadcast);
        socket.on(`${RoomEvent.UserLeaveBroadcast}`, handleRoomUserLeaveBroadcast);
        socket.on(`${RoomEvent.UsersStateSyncAll}`, handleRoomUsersStateSync);
    }

    async function joinRoom(roomId: string): Promise<void> {
        return new Promise((resolve) => {
            logger.debug('sent join request', roomId);
            socket.emit(`${RoomEvent.UserJoinRequest}`, roomId);

            socket.once(`${RoomEvent.UserJoinResponse}`, () => {
                resolve();
            });
        });
    }

    function leaveRoom(roomId: string) {
        logger.debug('sent leave request', roomId);
        socket.emit(`${RoomEvent.UserLeaveRequest}`, roomId);
    }

    function handleRoomUserJoinBroadcast(roomUser: IRoomUser) {
        logger.debug('user join broadcast', roomUser);
    }

    function handleRoomUserLeaveBroadcast(roomUser: IRoomUser) {
        logger.debug('user leave broadcast', roomUser);
    }

    function handleRoomUsersStateSync(newRoomUsers: IRoomUser[]) {
        logger.debug('users state sync', newRoomUsers);

        roomUserUseCase.setRoomUsers(newRoomUsers);
    }

    return {
        registerRoomUserSync,
        joinRoom,
        leaveRoom,
    };
}
