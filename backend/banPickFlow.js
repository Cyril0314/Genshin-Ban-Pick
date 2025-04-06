import { numberOfBan, numberOfPick, totalRounds } from './constants/constants.js';
// banPickFlow.js

export const banPickFlow = generateBanPickFlow({ banCount: numberOfBan, pickCount: numberOfPick, order: ['Team Aether', 'Team Lumine'], totalRounds: totalRounds });

console.log(JSON.stringify(banPickFlow, null, 2));

let stepMap = {}; // { roomId: stepIndex }

export function getCurrentStep(roomId) {
  const index = stepMap[roomId] || 0;
  return banPickFlow[index] || null;
}

export function advanceStep(io, roomId) {
  stepMap[roomId] = (stepMap[roomId] || 0) + 1;
  let step = getCurrentStep(roomId);
  io.to(roomId).emit('step.state.broadcast', step);
  console.log(`[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(step, null, 2)}`);
}

export function rollbackStep(io, roomId) {
  stepMap[roomId] = (stepMap[roomId] || 0) - 1;
  let step = getCurrentStep(roomId);
  io.to(roomId).emit('step.state.broadcast', step);
  console.log(`[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(step, null, 2)}`);
}

export function resetStep(io, roomId) {
  stepMap[roomId] = 0;
  let step = getCurrentStep(roomId);
  io.to(roomId).emit('step.state.broadcast', step);
  console.log(`[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(step, null, 2)}`);
}

export function generateBanPickFlow({
  banCount,
  pickCount,
  order,
  totalRounds
} = {}) {
  const flow = [];

  // 決定前後 Ban 數量（保證前半先 Ban 較多或平均）
  const frontBan = Math.ceil(banCount / totalRounds);
  const backBan = Math.floor(banCount / totalRounds);
  // 平均選取數量
  const halfPick = Math.floor(pickCount / totalRounds);
  const restPick = pickCount - halfPick;

  // ➤ 前段 Ban（交替）
  flow.push(...generateAlternateBanFlow({
    startIndex: 1,
    banCount: frontBan,
    startingTeam: order[1]
  }));

  // ➤ 前段 Pick（蛇行）
  flow.push(...generateSnakePickFlow({
    startIndex: 1,
    pickCount: halfPick,
    startingTeam: order[0]
  }));

  // ➤ 後段 Ban（交替）
  flow.push(...generateAlternateBanFlow({
    startIndex: frontBan + 1,
    banCount: backBan,
    startingTeam: order[0]
  }));

  // ➤ 後段 Pick（蛇行）
  flow.push(...generateSnakePickFlow({
    startIndex: halfPick + 1,
    pickCount: restPick,
    startingTeam: order[1]
  }));

  return flow;
}

function generateAlternateBanFlow({ startIndex, banCount, startingTeam }) {
  const teams = [startingTeam, getOpponent(startingTeam)];

  return Array.from({ length: banCount }, (_, i) => ({
    player: teams[i % 2],
    zoneId: `Ban ${startIndex + i}`,
    action: 'ban',
  }));
}

function generateSnakePickFlow({ startIndex, pickCount, startingTeam }) {
  const picks = [];
  const teams = [startingTeam, getOpponent(startingTeam)];
  let current = startIndex;

  const pairRounds = Math.floor(pickCount / 4);

  for (let i = 0; i < pairRounds; i++) {
    picks.push({ player: teams[0], zoneId: `Pick ${current++}`, action: 'pick' });
    picks.push({ player: teams[1], zoneId: `Pick ${current++}`, action: 'pick' });
    picks.push({ player: teams[1], zoneId: `Pick ${current++}`, action: 'pick' });
    picks.push({ player: teams[0], zoneId: `Pick ${current++}`, action: 'pick' });
  }

  return picks;
}

function getOpponent(team) {
  return team === 'Team Lumine' ? 'Team Aether' : 'Team Lumine';
}