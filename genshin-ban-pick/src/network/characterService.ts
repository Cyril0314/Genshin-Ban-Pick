// src/network/characterService.ts

import type { ICharacter } from '@/types/ICharacter'

export async function fetchCharacterMap(): Promise<Record<string, ICharacter>> {
    const response = await fetch('/api/characters')
    const characters = await response.json()

    const map: Record<string, ICharacter> = {}
    characters.forEach((char: any) => {
        map[char.name] = char
    })

    return map
}