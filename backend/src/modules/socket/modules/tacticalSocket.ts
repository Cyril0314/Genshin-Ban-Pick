// backend/src/socket/modules/tacticalSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';
import { TacticalCellImageMap, IRoomUser } from "../../room/index.ts";

const logger = createLogger('TATICAL SOCKET');

enum TacticalEvent {
    CellImagePlaceRequest = 'tactical.cell.image.place.request',
    CellImagePlaceBroadcast = 'tactical.cell.image.place.broadcast',

    CellImageRemoveRequest = 'tactical.cell.image.remove.request',
    CellImageRemoveBroadcast = 'tactical.cell.image.remove.broadcast',

    CellImageMapResetRequest = 'tactical.cell.image_map.reset.request',
    CellImageMapResetBroadcast = 'tactical.cell.image_map.reset.broadcast',

    CellImageMapStateRequest = 'tactical.cell.image_map.state.request',
    CellImageMapStateSyncSelf = 'tactical.cell.image_map.state.sync.self',
}

export function registerTacticalSocket(io: Server, socket: Socket, roomStateManager: IRoomStateManager) {
    socket.on(`${TacticalEvent.CellImagePlaceRequest}`, ({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) => {
        logger.info(`Received ${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId, imgId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        const previousCellId = findCellIdByImageIdDomain(roomState.teamTacticalCellImageMap[teamSlot], imgId);
        const displacedCellImgId = roomState.teamTacticalCellImageMap[teamSlot][cellId] ?? null;

        // 拖曳進來的格子有圖片
        if (previousCellId !== null) {
            delete roomState.teamTacticalCellImageMap[teamSlot][previousCellId];
        }

        // 拖曳進來的格子有圖片
        if (displacedCellImgId !== null) {
            delete roomState.teamTacticalCellImageMap[teamSlot][cellId];
        }

        // 將目標格子的圖片轉移到拖曳前的格子
        if (previousCellId !== null && displacedCellImgId !== null && previousCellId !== cellId) {
            roomState.teamTacticalCellImageMap[teamSlot][previousCellId] = displacedCellImgId;
        }

        roomState.teamTacticalCellImageMap[teamSlot][cellId] = imgId;

        socket.to(roomId).emit(`${TacticalEvent.CellImagePlaceBroadcast}`, { teamSlot, cellId, imgId });
        logger.info(`Sent ${TacticalEvent.CellImagePlaceBroadcast}`, { teamSlot, cellId, imgId });
    });

    socket.on(`${TacticalEvent.CellImageRemoveRequest}`, ({ teamSlot, cellId }: { teamSlot: number; cellId: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        delete roomState.teamTacticalCellImageMap[teamSlot][cellId];
        socket.to(roomId).emit(`${TacticalEvent.CellImageRemoveBroadcast}`, { teamSlot, cellId });
        logger.info(`Sent ${TacticalEvent.CellImageRemoveBroadcast}`, { teamSlot, cellId });
    });

    socket.on(`${TacticalEvent.CellImageMapResetRequest}`, ({ teamSlot }: { teamSlot: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageMapResetRequest}`, { teamSlot });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        roomState.teamTacticalCellImageMap[teamSlot] = {};
        socket.to(roomId).emit(`${TacticalEvent.CellImageMapResetBroadcast}`, { teamSlot });
        logger.info(`Sent ${TacticalEvent.CellImageMapResetBroadcast}`, { teamSlot });
    });

    socket.on(`${TacticalEvent.CellImageMapStateRequest}`, ({ teamSlot }: { teamSlot: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageMapStateRequest}`, { teamSlot });
        const roomId = (socket as any).roomId;
        syncTacticalCellImageMapStateSelf(socket, roomId, roomStateManager, teamSlot);
    });

    function findCellIdByImageIdDomain(tacticalCellImageMap: TacticalCellImageMap, imgId: string): number | null {
        const value = Object.entries(tacticalCellImageMap).find(([, f]) => f === imgId);
        if (!value) {
            console.debug('[TATICAL DOMAIN] Cannot find cell id by image id', imgId);
            return null;
        }
        console.debug('[TATICAL DOMAIN] Find cell id by image id', value[0], imgId);
        return Number(value[0]);
    }
}

export function syncTacticalCellImageMapStateSelf(socket: Socket, roomId: string, roomStateManager: IRoomStateManager, teamSlot: number) {
    const tacticalCellImageMap = roomStateManager.getTeamTacticalCellImageMap(roomId)[teamSlot];
    socket.emit(`${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
    logger.info(`Sent ${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
}

export function syncTacticalCellImageMapStateOther(
    roomUser: IRoomUser,
    io: Server,
    roomId: string,
    roomStateManager: IRoomStateManager,
    teamSlot: number,
) {
    const tacticalCellImageMap = roomStateManager.getTeamTacticalCellImageMap(roomId)[teamSlot];
    io.to(roomUser.id).emit(`${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
    logger.info(`Sent ${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
}
