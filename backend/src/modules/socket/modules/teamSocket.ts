// backend/src/modules/socket/modules/teamSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';
import { TeamEvent } from '@shared/contracts/team/value-types';
import { TeamService } from '../../team';

import type { TeamMember } from '@shared/contracts/team/TeamMember';

const logger = createLogger('TEAM SOCKET');

export function registerTeamSocket(io: Server, socket: Socket, teamService: TeamService) {
    socket.on(
        `${TeamEvent.MemberJoinRequest}`,
        ({ teamSlot, memberSlot, teamMember }: { teamSlot: number; memberSlot: number; teamMember: TeamMember }) => {
            logger.info(`Received ${TeamEvent.MemberJoinRequest} teamSlot: ${teamSlot}`, teamMember);
            const roomId = (socket as any).roomId;
            if (!roomId) return;

            teamService.join(roomId, { teamSlot, memberSlot, teamMember });
            socket.to(roomId).emit(`${TeamEvent.MemberJoinBroadcast}`, { teamSlot, memberSlot, teamMember });
            logger.info(`Sent ${TeamEvent.MemberJoinBroadcast} teamSlot: ${teamSlot}`, memberSlot, teamMember);
        },
    );

    socket.on(`${TeamEvent.MemberLeaveRequest}`, ({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) => {
        logger.info(`Received ${TeamEvent.MemberLeaveRequest} teamSlot: ${teamSlot}`, memberSlot);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        teamService.leave(roomId, { teamSlot, memberSlot });
        socket.to(roomId).emit(`${TeamEvent.MemberLeaveBroadcast}`, { teamSlot, memberSlot });
        logger.info(`Sent ${TeamEvent.MemberLeaveBroadcast} teamSlot: ${teamSlot}`, memberSlot);
    });

    socket.on(`${TeamEvent.MembersMapStateRequest}`, () => {
        logger.info(`Received ${TeamEvent.MembersMapStateRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const teamMembersMap = teamService.getTeamMembersMap(roomId);
        socket.emit(`${TeamEvent.MembersMapStateSyncSelf}`, teamMembersMap);
        logger.info(`Sent ${TeamEvent.MembersMapStateSyncSelf}`, teamMembersMap);
    });

    function syncTeamMembersMapStateAll(roomId: string) {
        const teamMembersMap = teamService.getTeamMembersMap(roomId);
        io.emit(`${TeamEvent.MembersMapStateSyncAll}`, teamMembersMap);
        logger.info(`Sent ${TeamEvent.MembersMapStateSyncAll}`, teamMembersMap);
    }
}
