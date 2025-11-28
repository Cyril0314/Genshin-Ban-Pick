// backend/src/modules/match/domain/restoreFilterFromJson.ts

import { Prisma } from '@prisma/client';
import { CharacterFilterKey } from '@shared/contracts/character/value-types';

export function restoreFiltersFromJson(json: Prisma.JsonValue): Record<CharacterFilterKey, string[]> {
    if (!json || typeof json !== 'object') {
        throw new Error('Invalid filters JSON');
    }
    const result: Partial<Record<CharacterFilterKey, string[]>> = {};

    const validKeys = Object.values(CharacterFilterKey);

    for (const [rawKey, rawValue] of Object.entries(json as any)) {
        // 取回 key → enum（確保 key 存在於 CharacterFilterKey）
        const key = rawKey as CharacterFilterKey;
        if (!validKeys.includes(key)) {
            throw new Error(`Unknown filter key: ${rawKey}`);
        }

        // 取回 value → string[]（確保是陣列且內容為字串）
        if (!Array.isArray(rawValue) || !rawValue.every((v) => typeof v === 'string')) {
            throw new Error(`Invalid filter values for key: ${rawKey}`);
        }

        result[key] = rawValue;
    }

    return result as Record<CharacterFilterKey, string[]>;
}
