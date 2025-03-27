import { initializeCharacterMap } from './data/characters.js';
import { setupAllDropZones } from './ui/dropZones.js';
import { setupAllButtons } from './ui/setupButtons.js';
import { setupGlobalEvents } from './features/dragAndDrop.js';
import { setupLayoutRules } from './ui/layout.js';
import { setupSocketListeners } from './network/socketListeners.js';

const socket = io();

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded');
    const characterMap = await initializeCharacterMap();
    setupAllButtons(characterMap, socket);
    setupAllDropZones(characterMap);
    setupGlobalEvents(characterMap, socket);
    setupLayoutRules();
    setupSocketListeners(characterMap, socket);

    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Log data to console for debugging
            // Display data on the page
            // dataContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // dataContainer.innerHTML = 'Failed to load data.';
        });
});