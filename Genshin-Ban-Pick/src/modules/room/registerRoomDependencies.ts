// src/modules/room/registerRoomDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import RoomUseCase from './application/RoomUseCase';
import RoomUserUseCase from './application/RoomUserUseCase';
import RoomRepository from './infrastructure/RoomRepository';
import RoomService from './infrastructure/RoomService';

import type { useRoomUserStore } from './store/roomUserStore';
import type { HttpClient } from '../../app/infrastructure/http/httpClient';
import type { App } from 'vue';

export function registerRoomDependencies(app: App, httpClient: HttpClient, roomUserStore: ReturnType<typeof useRoomUserStore>,) {
    const roomService = new RoomService(httpClient)
    const roomRepository = new RoomRepository(roomService)
    const roomUseCase = new RoomUseCase(roomRepository)

    const roomUserUseCase = new RoomUserUseCase(roomUserStore)

    app.provide(DIKeys.RoomUseCase, roomUseCase);
    app.provide(DIKeys.RoomUserUseCase, roomUserUseCase)
}
