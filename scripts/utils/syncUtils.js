// scripts/utils/syncUtils.js

import { getWishImagePath, originalImageSrc } from '../utils/imageUtils.js';

export function updateAndBroadcastImage(img, zone, characterMap, socket) {
    const imgId = img.id;
    originalImageSrc[imgId] = img.src;

    if (characterMap[imgId]) {
        img.src = getWishImagePath(imgId);
    }

    zone.appendChild(img);

    const zoneSelector = getSelectorForZone(zone);

    const event = new CustomEvent('imageMoved', {
        detail: {imgId, zoneSelector}
    });
    document.dispatchEvent(event);

    if (socket) {
        socket.emit('image.move.request', {
            imgId,
            zoneSelector,
            senderId: socket.id
        });
        console.log('[Client] Sent image.move.request:', imgId, zoneSelector);
    }
}

export function getSelectorForZone(zone) {
    if (zone.id) {
        return `#${zone.id}`;
        // return `[data-zone-id="${zone.dataset.id}"]`;
    }
    console.log(`${'.' + zone.className.split(' ').join('.')}`)
    return '.' + zone.className.split(' ').join('.');
}