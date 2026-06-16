// src/modules/player/domain/computeSignatureCharacter.ts

// 本命角色 = 使用次數最多者；同票取先出現者（先迭代到者勝）。
// 列表與 profile 共用此規則，避免兩處各自導出而在同票時分歧。
export function computeSignatureCharacter(characterCounts: Iterable<[string, number]>): string | undefined {
    let signatureCharacter: string | undefined;
    let max = 0;
    for (const [characterKey, count] of characterCounts) {
        if (count > max) {
            max = count;
            signatureCharacter = characterKey;
        }
    }
    return signatureCharacter;
}
