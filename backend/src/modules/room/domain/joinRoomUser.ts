// backend/src/modules/room/domain/joinRoomUser.ts

import { IRoomUser } from '../types/IRoomUser.ts';

export function joinRoomUser(roomUsers: IRoomUser[], identity: { identityKey: string; nickname: string; socketId: string }) {
    const joinedUser: IRoomUser = {
        id: identity.socketId,
        identityKey: identity.identityKey,
        nickname: identity.nickname,
        timestamp: Date.now(),
    };

    const index = roomUsers.findIndex((u) => u.identityKey === identity.identityKey);

    let newRoomUsers: IRoomUser[];

    if (index >= 0) {
        // 重連 → 替換舊值
        newRoomUsers = roomUsers.map((u, i) => (i === index ? { ...u, id: identity.socketId, timestamp: Date.now() } : u));
        return { joinedUser: newRoomUsers[index], isReconnect: true, roomUsers: newRoomUsers };
    } else {
        newRoomUsers = [...roomUsers, joinedUser];
        return { 
            joinedUser,
            isReconnect: false, 
            roomUsers: newRoomUsers 
        };
    }
}
