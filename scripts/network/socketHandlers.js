import { getWishImagePath, getProfileImagePath, originalImageSrc, resetImages } from '../utils/imageUtils.js';

export function setupSocketListeners(characterMap, socket) {
    socket.on('connect', () => {
        console.log('[Client] Connected to server with ID:', socket.id);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || 'default-room';
    socket.emit('join-room', roomId);

    socket.emit('get-state');

    socket.on('current-state', (state) => {
        console.log('[Client] Recovering state from server:', state);
        for (const [imgId, zoneSelector] of Object.entries(state)) {
            const img = document.getElementById(imgId);
            const zone = document.querySelector(zoneSelector);
    
            if (img && zone && !zone.querySelector('img')) {
                img.src = getWishImagePath(imgId);
                zone.appendChild(img);
            }
        }
    });

    socket.on('image-move', ({ imgId, zoneSelector, senderId }) => {
        console.log('[Client] Drag updated received from other user');
        if (socket.id === senderId) return;

        const draggedImg = document.getElementById(imgId);
        const dropZone = document.querySelector(zoneSelector);

        if (
            draggedImg &&
            dropZone &&
            (zoneSelector === '#image-options' || !dropZone.querySelector('img'))
        ) {
            if (zoneSelector === '#image-options') {
                draggedImg.src = getProfileImagePath(imgId);
            } else if (characterMap[imgId]) {
                originalImageSrc[imgId] = draggedImg.src;
                draggedImg.src = getWishImagePath(imgId);
            }

            dropZone.appendChild(draggedImg);
        }
    });

    socket.on('reset-images', () => {
        console.log("[Client] Reset received from other user");
        resetImages();
    });
}