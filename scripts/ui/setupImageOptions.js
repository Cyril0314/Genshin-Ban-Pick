// scripts/ui/setupImageOptions.js

import { getProfileImagePath } from '../utils/imageUtils.js';

export function setupImageOptions(characterMap) {
    const container = document.getElementById('image-options');
    const sortedKeys = Object.keys(characterMap).sort();
    sortedKeys.forEach(characterName => {
        const img = document.createElement('img');
        img.src = getProfileImagePath(characterName);
        img.draggable = true;
        img.id = characterName;
        container.appendChild(img);
    });
}