// src/modules/room/sync/useRoomUserSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { RoomEvent } from '@shared/contracts/room/value-types';
import { useRoomUserUseCase } from '../ui/composables/useRoomUserUseCase';

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

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
            console.debug('[ROOM USERS] Sent room user join request', roomId);
            socket.emit(`${RoomEvent.UserJoinRequest}`, roomId);

            socket.once(`${RoomEvent.UserJoinResponse}`, () => {
                resolve();
            });
        });
    }

    function leaveRoom(roomId: string) {
        console.debug('[ROOM USERS] Sent room user leave request', roomId);
        socket.emit(`${RoomEvent.UserLeaveRequest}`, roomId);
    }

    function handleRoomUserJoinBroadcast(roomUser: IRoomUser) {
        console.debug('[ROOM USERS] Handle room user join broadcast', roomUser);
    }

    function handleRoomUserLeaveBroadcast(roomUser: IRoomUser) {
        console.debug('[ROOM USERS] Handle room user leave broadcast', roomUser);
    }

    function handleRoomUsersStateSync(newRoomUsers: IRoomUser[]) {
        console.debug('[ROOM USERS] Handle room users state sync', newRoomUsers);

        roomUserUseCase.setRoomUsers(newRoomUsers);
    }

    return {
        registerRoomUserSync,
        joinRoom,
        leaveRoom,
    };
}
