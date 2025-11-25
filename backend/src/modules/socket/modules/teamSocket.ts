// backend/src/socket/modules/teamSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';
import { syncTacticalCellImageMapStateOther } from './tacticalSocket.ts';
import { TeamMember } from '../../../types/TeamMember.ts';

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
    socket.on(`${TeamEvent.MemberAddRequest}`, ({ teamSlot, memberSlot, member }: { teamSlot: number; memberSlot: number; member: TeamMember  }) => {
        logger.info(`Received ${TeamEvent.MemberAddRequest} teamSlot: ${teamSlot}`, member);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        for (const [teamSlot, teamMembers] of Object.entries(roomState.teamMembersMap)) {
            for (const [memberSlot, teamMember] of Object.entries(teamMembers)) {
                if (teamMember.type === 'Online' && member.type === 'Online'  && teamMember.user.identityKey === member.user.identityKey) {
                    delete roomState.teamMembersMap[Number(teamSlot)][Number(memberSlot)];
                    socket.to(roomId).emit(`${TeamEvent.MemberRemoveBroadcast}`, { teamSlot, memberSlot });
                    logger.info(`Sent ${TeamEvent.MemberRemoveBroadcast} teamSlot: ${teamSlot}`, memberSlot);
                }
            }
        }

        roomState.teamMembersMap[teamSlot][memberSlot] = member;
        socket.to(roomId).emit(`${TeamEvent.MemberAddBroadcast}`, { teamSlot, memberSlot, member });
        logger.info(`Sent ${TeamEvent.MemberAddBroadcast} teamSlot: ${teamSlot}`, memberSlot, member);

        const user = roomState.users.find((user) => (member.type === 'Online' && member.user.identityKey === user.identityKey));
        if (user) {
             syncTacticalCellImageMapStateOther(user, io, roomId, roomStateManager, teamSlot)
        }
    });

    socket.on(`${TeamEvent.MemberRemoveRequest}`, ({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) => {
        logger.info(`Received ${TeamEvent.MemberRemoveRequest} teamSlot: ${teamSlot}`, memberSlot);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        delete roomState.teamMembersMap[teamSlot][memberSlot];

        socket.to(roomId).emit(`${TeamEvent.MemberRemoveBroadcast}`, { teamSlot, memberSlot });
        logger.info(`Sent ${TeamEvent.MemberRemoveBroadcast} teamSlot: ${teamSlot}`, memberSlot);
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
