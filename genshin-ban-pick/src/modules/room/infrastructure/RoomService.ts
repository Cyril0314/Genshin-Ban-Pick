// src/modules/room/infrastructure/RoomService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { ITeam } from '@shared/contracts/team/ITeam';

export default class RoomService {
    constructor(private client: HttpClient) {}

    async get() {
        return this.client.get(`/rooms`, { withToken: false });
    }

    async post(
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
        return this.client.post(`/rooms/${roomId}`, payload, { withToken: false });
    }

    async getSetting(roomId: string) {
        return this.client.get(`/rooms/${roomId}/setting`);
    }
}
