// scripts/features/dragAndDrop.js

import { originalImageSrc } from '../utils/imageUtils.js';
import { updateAndBroadcastImage } from '../utils/syncUtils.js';
import { stepController } from '../logic/stepController.js';

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
        const imageOptions = document.getElementById('image-options');
        if (e.target.tagName === 'IMG' && imageOptions.contains(e.target)) {
            const imgId = e.target.id;
            originalImageSrc[imgId] = e.target.src;
            e.dataTransfer.setData('text/plain', imgId);
        }
    });

    const dropZones = document.querySelectorAll('.grid-item__drop-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedImgId = e.dataTransfer.getData('text/plain');
            const draggedImg = document.getElementById(draggedImgId);
            if (draggedImg && !zone.querySelector('img')) {
                updateAndBroadcastImage(draggedImg, zone, characterMap, socket);

                if (stepController.isCurrentZone(zone.id)) {
                    socket.emit('step.advance.request', {
                        senderId: socket.id
                    });

                    console.log('[Client] Sent step.advance.request');
                }
            }
        });
    });
}

/**
 * 點擊已放置的圖片可還原
 */
function setupClickRestore(socket) {
    document.addEventListener('click', e => {
        if (e.target.tagName !== 'IMG') return;

        const parent = e.target.parentElement;
        if (!parent.classList.contains('grid-item__drop-zone')) return;

        const imgId = e.target.id;
        const imageOptions = document.getElementById('image-options');
        e.target.src = originalImageSrc[imgId] || e.target.src;
        imageOptions.appendChild(e.target);

        const event = new CustomEvent('imageMoved', {
            detail: { imgId, zoneSelector: '#image-options' }
        });
        document.dispatchEvent(event);
        const zoneSelector = '#image-options';
        socket.emit('image.move.request', {
            imgId,
            zoneSelector,
            senderId: socket.id
        });
        console.log('[Client] Sent image.move.request: click image', imgId, zoneSelector);

        // const currentStep = stepController.get();
        // const zoneId = parent.id;
        // if (stepController.isCurrentZone(zoneId)) {
        //     socket.emit('step.rollback.request', { senderId: socket.id});
        //     console.log('[Client] Sent step-prev from restore');
        // }
    });
}
