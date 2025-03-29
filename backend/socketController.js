import { advanceStep, reverseStep, resetStep, getCurrentStep } from './banPickFlow.js';

const imageState = {}; // { roomId: { imgId: zoneSelector } }
const teamMembersState = {};

export function setupSocketIO(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            socket.roomId = roomId;
            console.log(`[Server] ${socket.id} joined room: ${roomId}`);
            if (!imageState[roomId]) imageState[roomId] = {};
            if (!teamMembersState[roomId]) teamMembersState[roomId] = { aether: '', lumine: '' };

            socket.emit('current-state', imageState[roomId]);
            socket.emit('team-members-batch', teamMembersState[roomId]);
            socket.emit('step-update', getCurrentStep(roomId));
        });

        socket.on('image-move', ({ imgId, zoneSelector, senderId }) => {
            const roomId = socket.roomId;
            if (!roomId) return;

            imageState[roomId][imgId] = zoneSelector;
            socket.to(roomId).emit('image-move', { imgId, zoneSelector, senderId });
        });

        socket.on('step-next', () => {
            const roomId = socket.roomId;
            if (!roomId) return;

            advanceStep(io, roomId);
        });

        socket.on('step-prev', () => {
            const roomId = socket.roomId;
            if (!roomId) return;

            reverseStep(io, roomId);
        });

        socket.on('reset-images', () => {
            const roomId = socket.roomId;
            if (!roomId) return;

            imageState[roomId] = {};
            resetStep(io, roomId);
            socket.to(roomId).emit('reset-images');
        });

        socket.on('team-members-update', ({ team, content }) => {
            const roomId = socket.roomId;
            if (!roomId) return;
            if (!teamMembersState[roomId]) {
                teamMembersState[roomId] = { aether: '', lumine: '' };
              }
            
              teamMembersState[roomId][team] = content;
            
            socket.to(roomId).emit('team-members-update', { team, content });
        });
    });
}
