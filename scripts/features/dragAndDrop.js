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
                updateAndBroadcastImage(draggedImg, zone, characterMap, socket);


                if (stepController.isCurrentZone(zone.dataset.zoneId)) {
                    socket.emit('step-next');
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
        if (!parent.classList.contains('drop-zone')) return;

        const imgId = e.target.id.replace('_clone', '');
        const imageOptions = document.getElementById('image-options');
        e.target.src = originalImageSrc[imgId] || e.target.src;
        imageOptions.appendChild(e.target);

        socket.emit('image-move', { imgId, zoneSelector: '#image-options', senderId: socket.id });
        console.log('[Client] Sent image-move: click image');

        // const currentStep = stepController.get();
        // const zoneId = parent.dataset.zoneId;
        // if (stepController.isCurrentZone(zoneId)) {
        //     socket.emit('step-prev');
        //     console.log('[Client] Sent step-prev from restore');
        // }
    });
}