// backend/src/socket/modules/imageSocket.ts

import { Server, Socket } from 'socket.io';

type RoomId = string;
type ImageMap = Record<string, string>;

export const imageState: Record<RoomId, ImageMap> = {};

export function registerImageSocket(io: Server, socket: Socket) {
    socket.on('image.drop.request', ({ imgId, zoneId, senderId }: { imgId: string; zoneId: string; senderId: string }) => {
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const who = socket.data.userId ?? socket.data.guestId;
        console.log(`[Socket] image.drop.request from:`, who);

        imageState[roomId][zoneId] = imgId;
        socket.to(roomId).emit('image.drop.broadcast', { imgId, zoneId, senderId });
    });

    socket.on('image.restore.request', ({ zoneId, senderId }: { zoneId: string; senderId: string }) => {
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        delete imageState[roomId][zoneId];
        socket.to(roomId).emit('image.restore.broadcast', { zoneId, senderId });
    });

    socket.on('image.reset.request', ({ senderId }: { senderId: string }) => {
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        imageState[roomId] = {};
        socket.to(roomId).emit('image.reset.broadcast', { senderId });
    });
}

export function syncImageState(socket: Socket, roomId: RoomId) {
    if (!imageState[roomId]) imageState[roomId] = {};
    console.log('syncImageState');
    socket.emit('image.state.sync', imageState[roomId]);
}
