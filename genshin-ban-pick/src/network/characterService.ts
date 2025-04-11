// src/network/characterService.ts

export async function fetchCharacterMap(): Promise<Record<string, any>> {
    const response = await fetch('/api/characters')
    const characters = await response.json()

    const map: Record<string, any> = {}
    characters.forEach((char: any) => {
        map[char.name] = char
    })

    return map
}