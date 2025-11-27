// src/modules/match/application/matchUseCase.ts

import { saveMatchDomain } from "../domain/saveMatchDomain";

export function matchUseCase() {
    async function saveMatch(roomId: string) {
        const matchResult = await saveMatchDomain(roomId);
        return matchResult;
    }

    return {
        saveMatch,
    };
}
