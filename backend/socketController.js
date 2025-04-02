// socketController.js

import { advanceStep, rollbackStep, resetStep, getCurrentStep } from './banPickFlow.js';

const imageState = {}; // { roomId: { imgId: zoneSelector } }
const teamMembersState = {};
const chatHistory = {};

export function setupSocketIO(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('room.join.request', (roomId) => {
            console.log(`[Server] ${socket.id} joined room: ${roomId}`);
            socket.join(roomId);
            socket.roomId = roomId;
            if (!imageState[roomId]) imageState[roomId] = {};
            if (!teamMembersState[roomId]) teamMembersState[roomId] = { aether: '', lumine: '' };
            if (!chatHistory[roomId]) chatHistory[roomId] = []

            socket.emit('image.state.sync', imageState[roomId]);
            socket.emit('team.members.state.sync', teamMembersState[roomId]);
            socket.emit('step.state.sync', getCurrentStep(roomId));
            socket.emit('chat.history.sync', chatHistory[roomId]);
        });

        socket.on('image.move.request', ({ imgId, zoneSelector, senderId }) => {
            console.log(`[Server] receive image.move.request from ${senderId} imgId: ${imgId}`);
            const roomId = socket.roomId;
            if (!roomId) return;

            imageState[roomId][imgId] = zoneSelector;
            socket.to(roomId).emit('image.move.broadcast', { imgId, zoneSelector, senderId });
            console.log(`[Server] emit image.move.broadcast to roomId: ${roomId} imgId: ${imgId}`);
        });

        socket.on('image.reset.request', ({ senderId }) => {
            console.log(`[Server] receive image.reset.request from ${senderId}`);
            const roomId = socket.roomId;
            if (!roomId) return;

            imageState[roomId] = {};
            socket.to(roomId).emit('images.reset.broadcast', { senderId });
            console.log(`[Server] emit image.reset.broadcast to roomId: ${roomId}`);
        });

        socket.on('step.advance.request', ({ senderId }) => {
            console.log(`[Server] receive step.advance.request from ${senderId}`);
            const roomId = socket.roomId;
            if (!roomId) return;

            advanceStep(io, roomId);
        });

        socket.on('step.rollback.request', ({ senderId }) => {
            console.log(`[Server] receive step.rollback.request from ${senderId}`);
            const roomId = socket.roomId;
            if (!roomId) return;

            rollbackStep(io, roomId);
        });

        socket.on('step.reset.request', ({ senderId }) => {
            console.log(`[Server] receive step.reset.request from ${senderId}`);
            const roomId = socket.roomId;
            if (!roomId) return;

            resetStep(io, roomId);
        });

        socket.on('team.members.update.request', ({ team, content, senderId }) => {
            console.log(`[Server] receive team.members.update.request from ${senderId} team ${team} ${content}`);
            const roomId = socket.roomId;
            if (!roomId) return;
            if (!teamMembersState[roomId]) {
                teamMembersState[roomId] = { aether: '', lumine: '' };
            }

            teamMembersState[roomId][team] = content;

            socket.to(roomId).emit('team.members.update.broadcast', { team, content, senderId });
            console.log(`[Server] emit team.members.update.broadcast to roomId: ${roomId} team ${team} ${content}`);
        });

        socket.on('chat.message.send.request', ({ senderName, message, senderId }) => {
            const roomId = socket.roomId;
            if (!roomId || !message) return;

            if (!chatHistory[roomId]) chatHistory[roomId] = [];
            chatHistory[roomId].push({ senderName, message });

            io.to(roomId).emit('chat.message.send.broadcast', {
                senderName,
                message,
                timestamp: Date.now(),
                senderId
            });
        });
    });
}
