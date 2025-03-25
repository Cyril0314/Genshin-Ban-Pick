import { getWishImagePath, originalImageSrc } from './imageUtils.js';

/**
 * 綁定拖曳事件到單一 drop zone
 */
export function setupDropZone(zone, characterMap) {
    zone.addEventListener('dragover', e => e.preventDefault());

    zone.addEventListener('drop', e => {
        e.preventDefault();
        const draggedImgId = e.dataTransfer.getData('text/plain');
        const draggedImg = document.getElementById(draggedImgId);

        if (draggedImg && !zone.querySelector('img')) {
            if (characterMap[draggedImgId]) {
                draggedImg.src = getWishImagePath(draggedImgId);
            }
            zone.appendChild(draggedImg);
        }
    });
}