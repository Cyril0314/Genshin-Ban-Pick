import { initializeCharacterMap } from './data/characters.js';
import { setupAllDropZones } from './ui/dropZones.js';
import { setupAllButtons } from './ui/setupButtons.js';
import { setupGlobalEvents } from './features/dragAndDrop.js';
import { setupLayoutRules } from './ui/layout.js';
import { originalImageSrc, getWishImagePath, getProfileImagePath, resetImages } from './utils/imageUtils.js';

// 新增 Socket.IO
const socket = io();

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded');
    const characterMap = await initializeCharacterMap();
    setupAllButtons(characterMap, socket);
    setupAllDropZones(characterMap);
    setupGlobalEvents(characterMap, socket);
    setupLayoutRules();

    socket.on('connect', () => {
        console.log('[Client] Connected to server with ID:', socket.id);
    });
    
    socket.on('drag-update', ({ imgId, zoneSelector, senderId }) => {
        console.log("socket.on drag-update")
        if (socket.id === senderId) return;
        const draggedImg = document.getElementById(imgId);
        const zone = document.querySelector(zoneSelector);
        
        if (draggedImg && zone && !zone.querySelector('img')) {
            if (characterMap[imgId]) {
                originalImageSrc[imgId] = draggedImg.src;
                draggedImg.src = getWishImagePath(imgId);
            }
            zone.appendChild(draggedImg);
        } else if (zoneSelector === '#image-options') {
            draggedImg.src = getProfileImagePath(imgId);
            zone.appendChild(draggedImg);
        }
    });

    socket.on('reset-images', () => {
        console.log("socket.on reset-images")
        resetImages();
    });

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