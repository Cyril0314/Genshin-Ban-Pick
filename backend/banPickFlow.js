// banPickFlow.js

// 📋 定義選角流程（可依照遊戲調整）
export const banPickFlow = [
    { player: 'Team Lumine', zoneId: 'Ban 1', action: 'ban' },
    { player: 'Team Aether', zoneId: 'Ban 2', action: 'ban' },
    { player: 'Team Lumine', zoneId: 'Ban 3', action: 'ban' },
    { player: 'Team Aether', zoneId: 'Ban 4', action: 'ban' },
    { player: 'Team Aether', zoneId: 'Pick 1', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 2', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 3', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 4', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 5', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 6', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 7', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 8', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 9', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 10', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 11', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 12', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 13', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 14', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 15', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 16', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Ban 5', action: 'ban' },
    { player: 'Team Lumine', zoneId: 'Ban 6', action: 'ban' },
    { player: 'Team Aether', zoneId: 'Ban 7', action: 'ban' },
    { player: 'Team Lumine', zoneId: 'Ban 8', action: 'ban' },
    { player: 'Team Lumine', zoneId: 'Pick 17', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 18', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 19', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 20', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 21', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 22', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 23', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 24', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 25', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 26', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 27', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 28', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 29', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 30', action: 'pick' },
    { player: 'Team Aether', zoneId: 'Pick 31', action: 'pick' },
    { player: 'Team Lumine', zoneId: 'Pick 32', action: 'pick' },
    
];

let stepMap = {}; // { roomId: stepIndex }

export function getCurrentStep(roomId) {
    const index = stepMap[roomId] || 0;
    return banPickFlow[index] || null;
}

export function advanceStep(io, roomId) {
    stepMap[roomId] = (stepMap[roomId] || 0) + 1;
    io.to(roomId).emit('step-update', getCurrentStep(roomId));
}

export function resetStep(io, roomId) {
    stepMap[roomId] = 0;
    io.to(roomId).emit('step-update', getCurrentStep(roomId));
}
