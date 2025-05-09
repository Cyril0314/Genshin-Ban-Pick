// backend/banPickFlow.ts

import { numberOfBan, numberOfPick, totalRounds } from './constants/constants.ts'
import { Server } from "socket.io";

export interface Step {
  player: string;
  zoneId: string;
  action: "ban" | "pick";
}

export const banPickFlow: Step[] = generateBanPickFlow({
  banCount: numberOfBan,
  pickCount: numberOfPick,
  order: ["Team Aether", "Team Lumine"],
  totalRounds,
});

console.log(JSON.stringify(banPickFlow, null, 2));

const stepMap: Record<string, number> = {};

export function getCurrentStep(roomId: string): Step | null {
  const index = stepMap[roomId] || 0;
  return banPickFlow[index] || null;
}

export function advanceStep(io: Server, roomId: string): void {
  stepMap[roomId] = (stepMap[roomId] || 0) + 1;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit("step.state.broadcast", step);
  console.log(
    `[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(
      step,
      null,
      2
    )}`
  );
}

export function rollbackStep(io: Server, roomId: string): void {
  stepMap[roomId] = (stepMap[roomId] || 0) - 1;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit("step.state.broadcast", step);
  console.log(
    `[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(
      step,
      null,
      2
    )}`
  );
}

export function resetStep(io: Server, roomId: string): void {
  stepMap[roomId] = 0;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit("step.state.broadcast", step);
  console.log(
    `[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(
      step,
      null,
      2
    )}`
  );
}

interface GenerateFlowOptions {
  banCount: number;
  pickCount: number;
  order: [string, string];
  totalRounds: number;
}

export function generateBanPickFlow({
  banCount,
  pickCount,
  order,
  totalRounds,
}: GenerateFlowOptions): Step[] {
  const flow: Step[] = [];

  const frontBan = Math.ceil(banCount / totalRounds);
  const backBan = Math.floor(banCount / totalRounds);

  const halfPick = Math.floor(pickCount / totalRounds);
  const restPick = pickCount - halfPick;

  flow.push(
    ...generateAlternateBanFlow({
      startIndex: 1,
      banCount: frontBan,
      startingTeam: order[1],
    })
  );
  flow.push(
    ...generateSnakePickFlow({
      startIndex: 1,
      pickCount: halfPick,
      startingTeam: order[0],
    })
  );
  flow.push(
    ...generateAlternateBanFlow({
      startIndex: frontBan + 1,
      banCount: backBan,
      startingTeam: order[0],
    })
  );
  flow.push(
    ...generateSnakePickFlow({
      startIndex: halfPick + 1,
      pickCount: restPick,
      startingTeam: order[1],
    })
  );

  return flow;
}

function generateAlternateBanFlow({
  startIndex,
  banCount,
  startingTeam,
}: {
  startIndex: number;
  banCount: number;
  startingTeam: string;
}): Step[] {
  const teams = [startingTeam, getOpponent(startingTeam)];

  return Array.from({ length: banCount }, (_, i) => ({
    player: teams[i % 2],
    zoneId: `zone-ban-${startIndex + i}`,
    action: "ban",
  }));
}

function generateSnakePickFlow({
  startIndex,
  pickCount,
  startingTeam,
}: {
  startIndex: number;
  pickCount: number;
  startingTeam: string;
}): Step[] {
  const picks: Step[] = [];
  const teams = [startingTeam, getOpponent(startingTeam)];
  let current = startIndex;
  const pairRounds = Math.floor(pickCount / 4);

  for (let i = 0; i < pairRounds; i++) {
    picks.push({
      player: teams[0],
      zoneId: `zone-pick-${current++}`,
      action: "pick",
    });
    picks.push({
      player: teams[1],
      zoneId: `zone-pick-${current++}`,
      action: "pick",
    });
    picks.push({
      player: teams[1],
      zoneId: `zone-pick-${current++}`,
      action: "pick",
    });
    picks.push({
      player: teams[0],
      zoneId: `zone-pick-${current++}`,
      action: "pick",
    });
  }

  return picks;
}

function getOpponent(team: string): string {
  return team === "Team Lumine" ? "Team Aether" : "Team Lumine";
}
