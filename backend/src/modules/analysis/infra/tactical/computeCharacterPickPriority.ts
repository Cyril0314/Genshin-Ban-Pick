
import { MoveType, MoveSource } from '@shared/contracts/match/value-types';

import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { IMatchMoveWeightCalcCore } from '../../types/IMatchMoveWeightCalcCore';

export function computeCharacterPickPriority(matchMoves: IMatchMoveWeightCalcCore[]): ICharacterPickPriority[] {
    const movesByMatch = new Map<number, IMatchMoveWeightCalcCore[]>();
    for (const move of matchMoves) {
        if (!movesByMatch.has(move.matchId)) {
            movesByMatch.set(move.matchId, []);
        }
        movesByMatch.get(move.matchId)!.push(move);
    }

    const characterStats = new Map<string, { totalNormalizedRank: number; count: number; totalRawIndex: number }>();

    for (const [matchId, moves] of movesByMatch) {
        const sortedMoves = moves.sort((a, b) => a.order - b.order);

        const pickMoves = sortedMoves.filter((m) => m.type === MoveType.Pick);

        const totalPicks = pickMoves.length;
        if (totalPicks <= 1) continue; 

        pickMoves.forEach((move, index) => {
            if (move.source === MoveSource.Random) return;

            const normalizedRank = index / (totalPicks - 1);

            if (!characterStats.has(move.characterKey)) {
                characterStats.set(move.characterKey, { totalNormalizedRank: 0, count: 0, totalRawIndex: 0 });
            }

            const stat = characterStats.get(move.characterKey)!;
            stat.totalNormalizedRank += normalizedRank;
            stat.totalRawIndex += index;
            stat.count += 1;
        });
    }

    const result: ICharacterPickPriority[] = [];
    for (const [key, stat] of characterStats.entries()) {
        result.push({
            characterKey: key,
            pickPriority: stat.totalNormalizedRank / stat.count,
            averageIndex: stat.totalRawIndex / stat.count,
            pickCount: stat.count,
        });
    }

    return result.sort((a, b) => a.pickPriority - b.pickPriority);
}
