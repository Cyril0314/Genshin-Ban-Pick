// src/modules/shared/domain/createTranslator.ts

export function createTranslator<T extends Record<string, string>>(map: T) {
    return (key: string) => (map[key] ?? null);
}