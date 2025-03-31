// socketController.js

import { advanceStep, rollbackStep, resetStep, getCurrentStep } from './banPickFlow.js';

const imageState = {}; // { roomId: { imgId: zoneSelector } }
const teamMembersState = {};

export function setupSocketIO(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('room.join.request', (roomId) => {
            socket.join(roomId);
            socket.roomId = roomId;
            console.log(`[Server] ${socket.id} joined room: ${roomId}`);
            if (!imageState[roomId]) imageState[roomId] = {};
            if (!teamMembersState[roomId]) teamMembersState[roomId] = { aether: '', lumine: '' };

            socket.emit('image.state.sync', imageState[roomId]);
            socket.emit('team.members.state.sync', teamMembersState[roomId]);
            socket.emit('step.state.sync', getCurrentStep(roomId));
        });

        socket.on('image.move.request', ({ imgId, zoneSelector, senderId }) => {
            const roomId = socket.roomId;
            if (!roomId) return;

            imageState[roomId][imgId] = zoneSelector;
            socket.to(roomId).emit('image.move.broadcast', { imgId, zoneSelector, senderId });
        });

        socket.on('image.reset.request', () => {
            const roomId = socket.roomId;
            if (!roomId) return;

            imageState[roomId] = {};
            socket.to(roomId).emit('images.reset.broadcast');
        });

        socket.on('step.advance.request', () => {
            const roomId = socket.roomId;
            if (!roomId) return;

            advanceStep(io, roomId);
        });

        socket.on('step.rollback.request', () => {
            const roomId = socket.roomId;
            if (!roomId) return;

            rollbackStep(io, roomId);
        });

        socket.on('step.reset.request', () => {
            const roomId = socket.roomId;
            if (!roomId) return;

            resetStep(io, roomId);
        });

        socket.on('team.members.update.request', ({ team, content }) => {
            const roomId = socket.roomId;
            if (!roomId) return;
            if (!teamMembersState[roomId]) {
                teamMembersState[roomId] = { aether: '', lumine: '' };
              }
            
              teamMembersState[roomId][team] = content;
            
            socket.to(roomId).emit('team.members.update.broadcast', { team, content });
        });
    });
}
