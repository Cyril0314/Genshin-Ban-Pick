import { originalImageSrc, getWishImagePath } from '../utils/imageUtils.js';

/**
 * 綁定整體拖曳與放置、圖片還原點擊事件
 */
export function setupGlobalEvents(characterMap, socket) {
    setupDragEvents(characterMap, socket);
    setupClickRestore(socket);
}

/**
 * 拖曳事件註冊
 */
function setupDragEvents(characterMap, socket) {
    document.addEventListener('dragstart', (e) => {
        console.log(`dragstart`)
        const imageOptions = document.getElementById('image-options');
        if (e.target.tagName === 'IMG' && imageOptions.contains(e.target)) {
            const imgId = e.target.id;
            originalImageSrc[imgId] = e.target.src;
            e.dataTransfer.setData('text/plain', imgId);
        }
    });

    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', (e) => {
            console.log(`drop`)
            e.preventDefault();
            const draggedImgId = e.dataTransfer.getData('text/plain');
            const draggedImg = document.getElementById(draggedImgId);
            if (draggedImg && !zone.querySelector('img')) {
                if (characterMap[draggedImgId]) {
                    draggedImg.src = getWishImagePath(draggedImgId);
                }
                zone.appendChild(draggedImg);

                const zoneSelector = getSelectorForZone(zone);
                console.log(`${zoneSelector}`)
                socket.emit('drag-update', { imgId: draggedImgId, zoneSelector, senderId: socket.id });
                console.log('[Client] Sent drag-update:', draggedImgId, zoneSelector);
            }
        });
    });
}

/**
 * 點擊已放置的圖片可還原
 */
function setupClickRestore(socket) {
    document.addEventListener('click', e => {
        if (e.target.tagName === 'IMG' && e.target.parentElement.classList.contains('drop-zone')) {
            const imgId = e.target.id.replace('_clone', '');
            const imageOptions = document.getElementById('image-options');
            e.target.src = originalImageSrc[imgId] || e.target.src;
            imageOptions.appendChild(e.target);

            // 廣播還原圖片事件
            socket.emit('drag-update', { imgId, zoneSelector: '#image-options' });
        }
    });
}

function getSelectorForZone(zone) {
    if (zone.dataset.zoneId) {
        return `[data-zone-id="${zone.dataset.zoneId}"]`;
    }
    return '.' + zone.className.split(' ').join('.');
}