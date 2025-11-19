// src/network/roomService.ts

import type { ITeam } from '@/types/ITeam';
import api from './httpClient';

import type { HttpClient } from './httpClient';

export function createRoomService(client: HttpClient = api) {
    async function get() {
        return client.get(`/rooms`, { withToken: false });
    }

    async function post(
        roomId: string,
        payload: {
            numberOfUtility?: number;
            numberOfBan?: number;
            numberOfPick?: number;
            totalRounds?: number;
            teams?: ITeam[];
            numberOfTeamSetup?: number;
            numberOfSetupCharacter?: number;
        },
    ) {
        return client.post(`/rooms/${roomId}`, payload, { withToken: false });
    }

    async function getSetting(roomId: string) {
        return client.get(`/rooms/${roomId}/setting`);
    }
    async function postSave(roomId: string) {
        return client.post(`/rooms/${roomId}/save`);
    }

    return {
        get,
        post,
        getSetting,
        postSave,
    };
}

export const roomService = createRoomService();
