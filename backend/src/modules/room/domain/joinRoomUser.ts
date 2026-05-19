// backend/src/modules/room/domain/joinRoomUser.ts

import { isSameIdentity } from '@shared/contracts/auth/Identity';

import type { Identity } from '@shared/contracts/auth/Identity';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

export function joinRoomUser(roomUsers: IRoomUser[], identity: Identity, nickname: string, socketId: string) {
    const joinedUser: IRoomUser = {
        socketId: socketId,
        identity,
        nickname: nickname,
        timestamp: Date.now(),
    };

    const index = roomUsers.findIndex((u) => isSameIdentity(u.identity, identity));

    let newRoomUsers: IRoomUser[];

    if (index >= 0) {
        // 重連 → 替換舊值
        newRoomUsers = roomUsers.map((u, i) => (i === index ? { ...u, socketId: socketId, timestamp: Date.now() } : u));
        return { joinedUser: undefined, roomUsers: newRoomUsers };
    } else {
        newRoomUsers = [...roomUsers, joinedUser];
        return {
            joinedUser,
            roomUsers: newRoomUsers,
        };
    }
}
