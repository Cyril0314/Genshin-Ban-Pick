// src/modules/board/domain/pickRandomImageDomain.ts

export function pickRandomImageDomain(array: string[], randomFn = Math.random) {
    return array[Math.floor(randomFn() * array.length)];
}