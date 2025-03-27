import { advanceStep, resetStep, getCurrentStep } from './banPickFlow.js';

const imageState = {}; // { roomId: { imgId: zoneSelector } }

export function setupSocketIO(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            socket.roomId = roomId;
            console.log(`[Server] ${socket.id} joined room: ${roomId}`);
            if (!imageState[roomId]) imageState[roomId] = {};

            socket.emit('current-state', imageState[roomId]);
            socket.emit('step-update', getCurrentStep(roomId));
        });

        socket.on('image-move', ({ imgId, zoneSelector, senderId }) => {
            const roomId = socket.roomId;
            if (!roomId) return;

            imageState[roomId][imgId] = zoneSelector;
            socket.to(roomId).emit('image-move', { imgId, zoneSelector, senderId });
            advanceStep(io, roomId);
        });

        socket.on('reset-images', () => {
            const roomId = socket.roomId;
            if (!roomId) return;

            imageState[roomId] = {};
            resetStep(io, roomId);
            socket.to(roomId).emit('reset-images');
        });
    });
}
