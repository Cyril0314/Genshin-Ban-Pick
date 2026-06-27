// 玩家角色 counts + 總出場數 → 顯示用頻率：補上 rate、依次數排序。
// 後端送原始 counts 與 setupCount；rate/排序屬呈現層，前端算。

export interface IPlayerCharacterFrequency {
    characterKey: string;
    count: number;
    rate: number;
}

export function computePlayerCharacterFrequency(characterCounts: Record<string, number>, setupCount: number): IPlayerCharacterFrequency[] {
    return Object.entries(characterCounts)
        .map(([characterKey, count]) => ({ characterKey, count, rate: setupCount > 0 ? count / setupCount : 0 }))
        .sort((a, b) => b.count - a.count);
}
