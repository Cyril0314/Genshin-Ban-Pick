// src/network/characterService.ts

import type { Character } from '@/types/Character'

export async function fetchCharacterMap(): Promise<Record<string, Character>> {
    const response = await fetch('/api/characters')
    const characters = await response.json()

    const map: Record<string, Character> = {}
    characters.forEach((char: any) => {
        map[char.name] = char
    })

    return map
}