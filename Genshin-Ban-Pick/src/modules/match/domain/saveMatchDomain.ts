// src/modules/room/domain/saveMatchDomain.ts

import { matchService } from '../infrastructure/matchService';

export async function saveMatchDomain(roomId: string) {
    const response = await matchService.post({ roomId });
    const matchData = response.data;
    return matchData;
}
