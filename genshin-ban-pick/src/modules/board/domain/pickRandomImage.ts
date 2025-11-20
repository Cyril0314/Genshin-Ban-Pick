// src/modules/board/domain/pickRandom.ts

export function pickRandom(array: string[], randomFn = Math.random) {
    return array[Math.floor(randomFn() * array.length)];
}