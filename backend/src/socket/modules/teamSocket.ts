// backend/src/socket/modules/teamSocket.ts

import { Server, Socket } from "socket.io";

import { teams } from "../../constants/constants.ts";

type RoomId = string;
type Members = string
export const teamMembersState: Record<RoomId, Record<number, Members>> = {};

export function registerTeamSocket(io: Server, socket: Socket) {
  socket.on(
    "team.members.update.request",
    ({ teamId, members, senderId }: { teamId: number; members: string; senderId: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      teamMembersState[roomId] ||= Object.fromEntries(teams.map(team => [team.id, ''])) as Record <number, Members>
      teamMembersState[roomId][teamId] = members;
      console.log(`teamId ${teamId} members ${members}`)
      socket.to(roomId).emit("team.members.update.broadcast", { teamId, members, senderId });
    }
  );
}

export function syncTeamState(socket: Socket, roomId: RoomId) {
    console.log("syncTeamState");
    if (!teamMembersState[roomId])
        teamMembersState[roomId] = Object.fromEntries(teams.map(team => [team.id, ''])) as Record <number, Members>
    socket.emit("team.members.state.sync", teamMembersState[roomId]);
}