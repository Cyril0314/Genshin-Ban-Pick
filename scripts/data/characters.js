import { getProfileImagePath } from '../utils/imageUtils.js';

export async function initializeCharacterMap() {
    const container = document.getElementById('image-options');
    const map = {};
    const response = await fetch('/api/characters');
    const characters = await response.json();

    characters.forEach(character => {
        const img = document.createElement('img');
        img.src = getProfileImagePath(character.name);
        img.draggable = true;
        img.id = character.name;
        container.appendChild(img);
        map[character.name] = character;
    });

    return map;
}