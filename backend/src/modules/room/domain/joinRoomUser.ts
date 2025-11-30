// backend/src/modules/room/domain/joinRoomUser.ts

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

export function joinRoomUser(roomUsers: IRoomUser[], identityKey: string, nickname: string, socketId: string) {
    const joinedUser: IRoomUser = {
        id: socketId,
        identityKey: identityKey,
        nickname: nickname,
        timestamp: Date.now(),
    };

    const index = roomUsers.findIndex((u) => u.identityKey === identityKey);

    let newRoomUsers: IRoomUser[];

    if (index >= 0) {
        // 重連 → 替換舊值
        newRoomUsers = roomUsers.map((u, i) => (i === index ? { ...u, id: socketId, timestamp: Date.now() } : u));
        return { joinedUser: null, roomUsers: newRoomUsers };
    } else {
        newRoomUsers = [...roomUsers, joinedUser];
        return {
            joinedUser,
            roomUsers: newRoomUsers,
        };
    }
}
