// src/network/characterService.ts

import type { CharacterInfo } from '@/types/CharacterInfo'

export async function fetchCharacterMap(): Promise<Record<string, CharacterInfo>> {
    const response = await fetch('/api/characters')
    const characters = await response.json()

    const map: Record<string, CharacterInfo> = {}
    characters.forEach((char: any) => {
        map[char.name] = char
    })

    return map
}