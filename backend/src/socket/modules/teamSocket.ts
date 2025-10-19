// backend/src/socket/modules/teamSocket.ts

import { Server, Socket } from "socket.io";

import { logger } from '../../utils/logger.ts';
import { RoomStateManager } from "../managers/RoomStateManager.ts";

enum SocketEvent {
    TEAM_MEMBERS_UPDATE_REQUEST = 'team.members.update.request',
    TEAM_MEMBERS_UPDATE_BROADCAST = 'team.members.update.broadcast',

    TEAM_MEMBERS_MAP_STATE_SYNC_SELF = 'team.members_map.state.sync.self',
}

export function registerTeamSocket(io: Server, socket: Socket, roomStateManager: RoomStateManager) {
  socket.on(
    `${SocketEvent.TEAM_MEMBERS_UPDATE_REQUEST}`,
    ({ teamId, members }: { teamId: number; members: string }) => {
      logger.info(`Received ${SocketEvent.TEAM_MEMBERS_UPDATE_REQUEST} teamId: ${teamId} members: ${members}`);
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      const roomState = roomStateManager.ensure(roomId);
      roomState.teamMembersMap[teamId] = members;
      socket.to(roomId).emit(`${SocketEvent.TEAM_MEMBERS_UPDATE_BROADCAST}`, { teamId, members });
      logger.info(`Sent ${SocketEvent.TEAM_MEMBERS_UPDATE_BROADCAST} teamId: ${teamId} members: ${members}`);
    }
  );
}

export function syncTeamState(socket: Socket, roomId: string, roomStateManager: RoomStateManager) {
    const teamMembersMap = roomStateManager.getTeamMembersMap(roomId)
    socket.emit(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_SELF}`, teamMembersMap);
    logger.info(`Sent ${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_SELF} teamMembersMap: ${JSON.stringify(teamMembersMap, null, 2)}`);
}