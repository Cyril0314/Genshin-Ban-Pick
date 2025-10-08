// backend/src/socket/modules/teamSocket.ts

import { Server, Socket } from "socket.io";

type Team = "aether" | "lumine";
type RoomId = string;

export const teamMembersState: Record<RoomId, Record<Team, string>> = {};

export function registerTeamSocket(io: Server, socket: Socket) {
  socket.on(
    "team.members.update.request",
    ({ team, content, senderId }: { team: Team; content: string; senderId: string }) => {
      const roomId = (socket as any).roomId;
      if (!roomId) return;

      teamMembersState[roomId] ||= { aether: "", lumine: "" };
      teamMembersState[roomId][team] = content;

      socket.to(roomId).emit("team.members.update.broadcast", { team, content, senderId });
    }
  );
}

export function syncTeamState(socket: Socket, roomId: RoomId) {
    console.log("syncTeamState");
    if (!teamMembersState[roomId])
        teamMembersState[roomId] = { aether: "", lumine: "" };
    socket.emit("team.members.state.sync", teamMembersState[roomId]);
}