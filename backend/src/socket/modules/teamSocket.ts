// backend/src/socket/modules/teamSocket.ts

import { Server, Socket } from "socket.io";

import { logger } from '../../utils/logger.ts';
import { teams } from "../../constants/constants.ts";

enum SocketEvent {
    TEAM_MEMBERS_UPDATE_REQUEST = 'team.members.update.request',
    TEAM_MEMBERS_UPDATE_BROADCAST = 'team.members.update.broadcast',

    TEAM_MEMBERS_STATE_SYNC = 'team.members.state.sync',
}

type RoomId = string;
type Members = string
export const teamMembersState: Record<RoomId, Record<number, Members>> = {};

export function registerTeamSocket(io: Server, socket: Socket) {
  socket.on(
    `${SocketEvent.TEAM_MEMBERS_UPDATE_REQUEST}`,
    ({ teamId, members, senderId }: { teamId: number; members: string; senderId: string }) => {
      logger.info(`Received ${SocketEvent.TEAM_MEMBERS_UPDATE_REQUEST} teamId: ${teamId} members: ${members} senderId: ${senderId}`);
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      teamMembersState[roomId] ||= Object.fromEntries(teams.map(team => [team.id, ''])) as Record <number, Members>
      teamMembersState[roomId][teamId] = members;
      socket.to(roomId).emit(`${SocketEvent.TEAM_MEMBERS_UPDATE_BROADCAST}`, { teamId, members, senderId });
      logger.info(`Sent ${SocketEvent.TEAM_MEMBERS_UPDATE_BROADCAST} teamId: ${teamId} members: ${members} senderId: ${senderId}`);
    }
  );
}

export function syncTeamState(socket: Socket, roomId: RoomId) {
    const teamMembers = teamMembersState[roomId] || Object.fromEntries(teams.map(team => [team.id, ''])) as Record <number, Members>
    socket.emit(`${SocketEvent.TEAM_MEMBERS_STATE_SYNC}`, teamMembers);
    logger.info(`Sent ${SocketEvent.TEAM_MEMBERS_STATE_SYNC} chatMessages: ${JSON.stringify(teamMembers, null, 2)}`);
}