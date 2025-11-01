// backend/src/socket/modules/teamSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';
import { TeamMember } from '../../types/IRoomState.ts';
import { syncTaticalCellImageMapStateOther } from './taticalSocket.ts';

const logger = createLogger('TEAM SOCKET');

enum SocketEvent {
    TEAM_MEMBER_ADD_REQUEST = 'team.member.add.request',
    TEAM_MEMBER_ADD_BROADCAST = 'team.member.add.broadcast',
    TEAM_MEMBER_REMOVE_REQUEST = 'team.member.remove.request',
    TEAM_MEMBER_REMOVE_BROADCAST = 'team.member.remove.broadcast',

    TEAM_MEMBERS_MAP_STATE_SYNC_SELF = 'team.members_map.state.sync.self',
    TEAM_MEMBERS_MAP_STATE_SYNC_ALL = 'team.members_map.state.sync.all',
}

export function registerTeamSocket(io: Server, socket: Socket, roomStateManager: RoomStateManager) {
    socket.on(`${SocketEvent.TEAM_MEMBER_ADD_REQUEST}`, ({ teamId, member }: { teamId: number; member: TeamMember }) => {
        logger.info(`Received ${SocketEvent.TEAM_MEMBER_ADD_REQUEST} teamId: ${teamId}`, member);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        roomState.teamMembersMap[teamId].push(member);
        socket.to(roomId).emit(`${SocketEvent.TEAM_MEMBER_ADD_BROADCAST}`, { teamId, member });
        logger.info(`Sent ${SocketEvent.TEAM_MEMBER_ADD_BROADCAST} teamId: ${teamId}`, member);

        const user = roomState.users.find((user) => (member.type === 'online' && member.user.identityKey === user.identityKey));
        if (user) {
             syncTaticalCellImageMapStateOther(user, io, roomId, roomStateManager, teamId)
        }
    });

    socket.on(`${SocketEvent.TEAM_MEMBER_REMOVE_REQUEST}`, ({ teamId, member }: { teamId: number; member: TeamMember }) => {
        logger.info(`Received ${SocketEvent.TEAM_MEMBER_REMOVE_REQUEST} teamId: ${teamId}`, member);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);

        const index = roomState.teamMembersMap[teamId].findIndex((m) => {
            return (
                (m.type === 'manual' && member.type === 'manual' && m.name === member.name) ||
                (m.type === 'online' && member.type === 'online' && m.user.identityKey === member.user.identityKey)
            );
        });

        if (index !== -1) {
            logger.debug('index', index);
            roomState.teamMembersMap[teamId].splice(index, 1);
        }

        socket.to(roomId).emit(`${SocketEvent.TEAM_MEMBER_REMOVE_BROADCAST}`, { teamId, member });
        logger.info(`Sent ${SocketEvent.TEAM_MEMBER_REMOVE_BROADCAST} teamId: ${teamId}`, member);
    });
}

export function syncTeamMembersMapStateSelf(socket: Socket, roomId: string, roomStateManager: RoomStateManager) {
    const teamMembersMap = roomStateManager.getTeamMembersMap(roomId);
    socket.emit(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_SELF}`, teamMembersMap);
    logger.info(`Sent ${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_SELF}`, teamMembersMap);
}

export function syncTeamMembersMapStateAll(io: Server, roomId: string, roomStateManager: RoomStateManager) {
    const teamMembersMap = roomStateManager.getTeamMembersMap(roomId);
    io.emit(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_ALL}`, teamMembersMap);
    logger.info(`Sent ${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_ALL}`, teamMembersMap);
}
