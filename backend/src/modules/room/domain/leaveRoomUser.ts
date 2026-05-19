// backend/src/modules/room/domain/leaveRoomUser.ts

import { isSameIdentity } from '@shared/contracts/identity/Identity';

import type { Identity } from '@shared/contracts/identity/Identity';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

export function leaveRoomUser(roomUsers: IRoomUser[], identity: Identity) {
    const leavingUser = roomUsers.find((u) => isSameIdentity(u.identity, identity));
    const newRoomUsers = roomUsers.filter((u) => !isSameIdentity(u.identity, identity));
    return {
        leavingUser,
        roomUsers: newRoomUsers
    }
}
