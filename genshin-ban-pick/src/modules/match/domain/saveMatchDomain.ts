// src/modules/room/domain/saveMatchDomain.ts

import { matchService } from '../infrastructure/matchService';

import type { IMatchResult } from '../types/IMatchResult';

export async function saveMatchDomain(roomId: string) {
    const response = await matchService.post({ roomId });
    const matchData = response.data;
    return matchData as IMatchResult;
}
