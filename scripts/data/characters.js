// scripts/data/character.js

export async function fetchCharacterMap() {
    const map = {};
    const response = await fetch('/api/characters');
    const characters = await response.json();
    characters.forEach(character => {
        map[character.name] = character;
    });
    return map;
}
