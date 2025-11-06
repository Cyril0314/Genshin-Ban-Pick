// backend/src/socket/modules/teamSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';
import { syncTacticalCellImageMapStateOther } from './tacticalSocket.ts';
import { TeamMember } from '../../types/TeamMember.ts';

const logger = createLogger('TEAM SOCKET');

enum TeamEvent {
    MemberAddRequest = 'team.member.add.request',
    MemberAddBroadcast = 'team.member.add.broadcast',
    MemberRemoveRequest = 'team.member.remove.request',
    MemberRemoveBroadcast = 'team.member.remove.broadcast',

    MembersMapStateSyncSelf = 'team.members_map.state.sync.self',
    MembersMapStateSyncAll = 'team.members_map.state.sync.all',
}

export function registerTeamSocket(io: Server, socket: Socket, roomStateManager: IRoomStateManager) {
    socket.on(`${TeamEvent.MemberAddRequest}`, ({ teamSlot, member }: { teamSlot: number; member: TeamMember }) => {
        logger.info(`Received ${TeamEvent.MemberAddRequest} teamSlot: ${teamSlot}`, member);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        roomState.teamMembersMap[teamSlot].push(member);
        socket.to(roomId).emit(`${TeamEvent.MemberAddBroadcast}`, { teamSlot, member });
        logger.info(`Sent ${TeamEvent.MemberAddBroadcast} teamSlot: ${teamSlot}`, member);

        const user = roomState.users.find((user) => (member.type === 'Online' && member.user.identityKey === user.identityKey));
        if (user) {
             syncTacticalCellImageMapStateOther(user, io, roomId, roomStateManager, teamSlot)
        }
    });

    socket.on(`${TeamEvent.MemberRemoveRequest}`, ({ teamSlot, member }: { teamSlot: number; member: TeamMember }) => {
        logger.info(`Received ${TeamEvent.MemberRemoveRequest} teamSlot: ${teamSlot}`, member);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);

        const index = roomState.teamMembersMap[teamSlot].findIndex((m) => {
            return (
                (m.type === 'Manual' && member.type === 'Manual' && m.name === member.name) ||
                (m.type === 'Online' && member.type === 'Online' && m.user.identityKey === member.user.identityKey)
            );
        });

        if (index !== -1) {
            logger.debug('index', index);
            roomState.teamMembersMap[teamSlot].splice(index, 1);
        }

        socket.to(roomId).emit(`${TeamEvent.MemberRemoveBroadcast}`, { teamSlot, member });
        logger.info(`Sent ${TeamEvent.MemberRemoveBroadcast} teamSlot: ${teamSlot}`, member);
    });
}

export function syncTeamMembersMapStateSelf(socket: Socket, roomId: string, roomStateManager: IRoomStateManager) {
    const teamMembersMap = roomStateManager.getTeamMembersMap(roomId);
    socket.emit(`${TeamEvent.MembersMapStateSyncSelf}`, teamMembersMap);
    logger.info(`Sent ${TeamEvent.MembersMapStateSyncSelf}`, teamMembersMap);
}

export function syncTeamMembersMapStateAll(io: Server, roomId: string, roomStateManager: IRoomStateManager) {
    const teamMembersMap = roomStateManager.getTeamMembersMap(roomId);
    io.emit(`${TeamEvent.MembersMapStateSyncAll}`, teamMembersMap);
    logger.info(`Sent ${TeamEvent.MembersMapStateSyncAll}`, teamMembersMap);
}
