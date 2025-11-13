// synergyNormalization.ts

export type SynergyMatrix = Record<string, Record<string, number>>;

/**
 * 計算每個角色的出場次數（用於 Jaccard）
 */
function computeCounts(raw: SynergyMatrix): Record<string, number> {
    const count: Record<string, number> = {};

    for (const a of Object.keys(raw)) {
        // 自己出現的次數 = row sum（或使用 raw synergy 生成時的 count）
        count[a] = Object.values(raw[a]).reduce((s, v) => s + (v > 0 ? 1 : 0), 0);
    }

    return count;
}

/**
 * Jaccard Similarity
 * J(a,b) = w_ab / (count[a] + count[b] - w_ab)
 */
function applyJaccard(raw: SynergyMatrix): SynergyMatrix {
    const result: SynergyMatrix = {};
    const count = computeCounts(raw);

    for (const a of Object.keys(raw)) {
        result[a] ??= {};
        for (const b of Object.keys(raw)) {
            if (a === b) {
                result[a][b] = 0; // 不需要自己和自己
                continue;
            }

            const w = raw[a]?.[b] ?? 0;
            const denom = count[a] + count[b] - w;
            result[a][b] = denom > 0 ? w / denom : 0;
        }
    }

    return result;
}

/**
 * Cosine similarity between two vectors
 */
function cosine(a: number[], b: number[]): number {
    let dot = 0,
        na = 0,
        nb = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

/**
 * 建立 Cosine Similarity Matrix
 */
function applyCosine(raw: SynergyMatrix): SynergyMatrix {
    const chars = Object.keys(raw);
    const result: SynergyMatrix = {};

    const vectors = chars.map((a) => chars.map((b) => raw[a]?.[b] ?? 0));

    for (let i = 0; i < chars.length; i++) {
        const a = chars[i];
        result[a] ??= {};

        for (let j = 0; j < chars.length; j++) {
            if (i === j) {
                result[a][chars[j]] = 0;
                continue;
            }
            result[a][chars[j]] = cosine(vectors[i], vectors[j]);
        }
    }

    return result;
}

/**
 * 主入口：根據 mode 回傳不同 Normalized Matrix
 */
export function normalizeSynergy(raw: SynergyMatrix, mode: 'jaccard' | 'cosine' = 'jaccard'): SynergyMatrix {
    switch (mode) {
        case 'jaccard':
            return applyJaccard(raw);

        case 'cosine':
            return applyCosine(raw);

        default:
            throw new Error(`Unknown synergy normalization mode: ${mode}`);
    }
}
