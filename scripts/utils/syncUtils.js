// syncUtils.js
import { getWishImagePath, originalImageSrc } from '../utils/imageUtils.js';

export function updateAndBroadcastImage(img, zone, characterMap, socket) {
    const imgId = img.id;
    originalImageSrc[imgId] = img.src;

    if (characterMap[imgId]) {
        img.src = getWishImagePath(imgId);
    }

    zone.appendChild(img);

    if (socket) {
        const zoneSelector = getSelectorForZone(zone);
        socket.emit('image.move.request', {
            imgId,
            zoneSelector,
            senderId: socket.id
        });
        console.log('[Client] Sent image.move.request:', imgId, zoneSelector);
    }
}

export function getSelectorForZone(zone) {
    if (zone.dataset.zoneId) {
        return `[data-zone-id="${zone.dataset.zoneId}"]`;
    }
    console.log(`${'.' + zone.className.split(' ').join('.')}`)
    return '.' + zone.className.split(' ').join('.');
}
