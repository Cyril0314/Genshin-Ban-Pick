// backend/src/modules/room/domain/joinRoomUser.ts

import { IRoomUser } from '../types/IRoomUser.ts';

export function leaveRoomUser(roomUsers: IRoomUser[], identityKey: string) {
    const leavingUser = roomUsers.find((u) => u.identityKey === identityKey);
    const newRoomUsers = roomUsers.filter((u) => u.identityKey !== identityKey);
    return {
        leavingUser,
        roomUsers: newRoomUsers
    }
}
