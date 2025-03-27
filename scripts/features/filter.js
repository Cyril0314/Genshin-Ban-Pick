import { updateAndBroadcastImage } from '../utils/syncUtils.js';

/**
 * 根據 side ('left' 或 'right') 選擇角色並分配
 */
export function handleSelection(side, characterMap, socket) {
    const weapon = document.getElementById(`${side}-weapon-select`).value;
    const element = document.getElementById(`${side}-element-select`).value;

    const images = Array.from(document.querySelectorAll('#image-options img'));
    const filtered = images.filter(img => {
        const char = characterMap[img.id];
        if (!char || char.name === 'Traveler') return false;

        const matchWeapon = (weapon === 'All' || char.weapon === weapon);
        const matchElement = (element === 'All' || char.element === element);
        return matchWeapon || matchElement;
    });
    // 計算總需配的數量
    const rows = Array.from(document.querySelectorAll('.ban-zone-wrapper .grid-row'));
    let totalNeeded = 0;
    rows.forEach(row => {
        totalNeeded += Math.floor(row.querySelectorAll('.grid-item-row').length / 2);
    });

    if (filtered.length < totalNeeded) {
        console.error(`[Filter] 篩選後圖片不足，需 ${totalNeeded} 張，僅有 ${filtered.length}`);
        return;
    }

    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, totalNeeded);
    distributeToRowsPerVisualRow(selected, side, characterMap, socket);
}

/**
 * 把圖片分配到 ban zone 左／右欄位
 */
function distributeToRowsPerVisualRow(images, side, characterMap, socket) {
    const rows = Array.from(document.querySelectorAll('.ban-zone-wrapper .grid-row'));
    let imageIndex = 0;

    rows.forEach(row => {
        const zones = Array.from(row.querySelectorAll('.grid-item-row.drop-zone'));
        const half = Math.floor(zones.length / 2);

        if (side === 'left') {
            for (let i = 0; i < half && imageIndex < images.length; i++) {
                updateAndBroadcastImage(images[imageIndex++], zones[i], characterMap, socket);
            }
        } else if (side === 'right') {
            for (let i = half; i < zones.length && imageIndex < images.length; i++) {
                updateAndBroadcastImage(images[imageIndex++], zones[i], characterMap, socket);
            }
        }
    });
}