import { numberOfBan, numberOfPick, totalRounds } from './constants/constants.js';
// banPickFlow.js

export const banPickFlow = generateBanPickFlow({ banCount: numberOfBan, pickCount: numberOfPick, order: ['Team Lumine', 'Team Aether'], totalRounds: totalRounds });

// console.log(JSON.stringify(banPickFlow, null, 2));

let stepMap = {}; // { roomId: stepIndex }

export function getCurrentStep(roomId) {
  const index = stepMap[roomId] || 0;
  return banPickFlow[index] || null;
}

export function advanceStep(io, roomId) {
  stepMap[roomId] = (stepMap[roomId] || 0) + 1;
  io.to(roomId).emit('step-update', getCurrentStep(roomId));
}

export function reverseStep(io, roomId) {
  stepMap[roomId] = (stepMap[roomId] || 0) - 1;
  io.to(roomId).emit('step-update', getCurrentStep(roomId));
}

export function resetStep(io, roomId) {
  stepMap[roomId] = 0;
  io.to(roomId).emit('step-update', getCurrentStep(roomId));
}

export function generateBanPickFlow({
  banCount,
  pickCount,
  order,
  totalRounds
} = {}) {
  const flow = [];
  const halfPick = Math.floor(pickCount / totalRounds);

  // 決定前後 Ban 數量（保證前半先 Ban 較多或平均）
  const frontBan = Math.ceil(banCount / totalRounds);
  const backBan = Math.floor(banCount / totalRounds);

  // ➤ 前段 Ban（交替）
  for (let i = 1; i <= frontBan; i++) {
    flow.push({
      player: order[(i + 1) % 2],
      zoneId: `Ban ${i}`,
      action: 'ban'
    });
  }

  // ➤ 前段 Pick（蛇行，先手 = order[1]）
  flow.push(...generateSnakePickFlow({
    startIndex: 1,
    pickCount: halfPick,
    startingTeam: order[1]
  }));

  // ➤ 後段 Ban（交替）
  for (let i = 1; i <= backBan; i++) {
    const banIndex = frontBan + i;
    flow.push({
      player: order[i % 2],
      zoneId: `Ban ${banIndex}`,
      action: 'ban'
    });
  }

  // ➤ 後段 Pick（蛇行，先手 = order[0]）
  flow.push(...generateSnakePickFlow({
    startIndex: halfPick + 1,
    pickCount: pickCount - halfPick,
    startingTeam: order[0]
  }));

  return flow;
}

function generateSnakePickFlow({ startIndex, pickCount, startingTeam }) {
  const picks = [];
  const teams = [startingTeam, startingTeam === 'Team Lumine' ? 'Team Aether' : 'Team Lumine'];
  let current = startIndex;

  // 起手選 1
  picks.push({ player: teams[0], zoneId: `Pick ${current++}`, action: 'pick' });

  const remaining = pickCount - 2; // 除起手 + 收尾
  const pairRounds = Math.floor(remaining / 2);

  for (let i = 0; i < pairRounds; i++) {
    let teamIndex = (i + 1) % 2
    picks.push({ player: teams[teamIndex], zoneId: `Pick ${current++}`, action: 'pick' });
    picks.push({ player: teams[teamIndex], zoneId: `Pick ${current++}`, action: 'pick' });
  }

  // 收尾給起手
  picks.push({ player: teams[0], zoneId: `Pick ${current++}`, action: 'pick' });

  return picks;
}
