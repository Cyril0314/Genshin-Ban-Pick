// scripts/features/radomizer.js

import { filteredImages } from './filter.js';
import { updateAndBroadcastImage } from '../utils/syncUtils.js';
import { stepController } from '../logic/stepController.js';

/**
 * 處理 Utility 隨機功能
 */
export function handleUtilityRandom(characterMap, socket) {
    const images = filteredImages(characterMap)

    const zone = Array.from(document.querySelectorAll('.utility-zone__columns .grid-item__drop-zone'))
        .find(z => !z.querySelector('img'));

    if (!zone || images.length === 0) return;

    const selected = images.sort(() => 0.5 - Math.random())[0];
    updateAndBroadcastImage(selected, zone, characterMap, socket);
}

/**
 * 處理 Pick 隨機功能
 */
export function handlePickRandom(characterMap, roomSetting, socket) {
    const images = filteredImages(characterMap)

    const pickZones = Array.from(document.querySelectorAll('.pick-zone__columns .grid-item__drop-zone'))
    const nextPickStep = roomSetting.banPickFlow.find(step => {
        if (step.action !== "pick") return false;
        const zone = pickZones.find(z => z.id === step.zoneId);
        return zone && !zone.querySelector('img');
    });
    if (!nextPickStep || images.length === 0) return;

    const targetPickZone = pickZones.find(z => z.id === nextPickStep.zoneId);
    if (!targetPickZone) return;

    const selected = images.sort(() => 0.5 - Math.random())[0];
    updateAndBroadcastImage(selected, targetPickZone, characterMap, socket);

    if (stepController.isCurrentZone(targetPickZone.id)) {
        socket.emit('step.advance.request', {
            senderId: socket.id
        });
    }
}

/**
 * 處理 Ban 隨機功能
 */
export function handleBanRandom(characterMap, roomSetting, socket) {
    const images = filteredImages(characterMap)

    const banZones = Array.from(document.querySelectorAll('.ban-zone__rows .grid-item__drop-zone'))
    const nextBanStep = roomSetting.banPickFlow.find(step => {
        if (step.action !== "ban") return false;
        const zone = banZones.find(z => z.id === step.zoneId);
        return zone && !zone.querySelector('img');
    });
    if (!nextBanStep || images.length === 0) return;

    const targetBanZone = banZones.find(z => z.id === nextBanStep.zoneId);
    if (!targetBanZone) return;

    const selected = images.sort(() => 0.5 - Math.random())[0];
    updateAndBroadcastImage(selected, targetBanZone, characterMap, socket);

    if (stepController.isCurrentZone(targetBanZone.id)) {
        socket.emit('step.advance.request', {
            senderId: socket.id
        });
    }
}

// /**
//  * 分配到主欄位四行：前後五星、中間四星
//  */
// function distributeImagesToDropZones(fiveStars, fourStars, characterMap, socket) {
//     const zones = document.querySelectorAll('.grid-item__drop-zone--pick');

//     [0, 3].forEach(row => {
//         for (let i = 0; i < 8; i++) {
//             const img = fiveStars.shift();
//             updateAndBroadcastImage(img, zones[row * 8 + i], characterMap, socket);
//         }
//     });

//     [1, 2].forEach(row => {
//         for (let i = 0; i < 8; i++) {
//             const img = fourStars.shift();
//             updateAndBroadcastImage(img, zones[row * 8 + i], characterMap, socket);
//         }
//     });
// }

// /**
//  * 把圖片分配到 ban zone 左／右欄位
//  */
// function distributeToRowsPerVisualRow(images, side, characterMap, socket) {
//     const rows = Array.from(document.querySelectorAll('.ban-zone__rows .grid__row'));
//     let imageIndex = 0;

//     rows.forEach(row => {
//         const zones = Array.from(row.querySelectorAll('.grid-item__drop-zone'));
//         const half = Math.floor(zones.length / 2);

//         if (side === 'left') {
//             for (let i = 0; i < half && imageIndex < images.length; i++) {
//                 updateAndBroadcastImage(images[imageIndex++], zones[i], characterMap, socket);
//             }
//         } else if (side === 'right') {
//             for (let i = half; i < zones.length && imageIndex < images.length; i++) {
//                 updateAndBroadcastImage(images[imageIndex++], zones[i], characterMap, socket);
//             }
//         }
//     });
// }

// /**
//  * 根據 side ('left' 或 'right') 選擇角色並分配
//  */
// export function handleSelection(characterMap, socket) {
//     const team = document.querySelector(`.selector__select--team`).value;
//     const side = team === 'Aether' ? 'left' : 'right';

//     const images = Array.from(document.querySelectorAll('#image-options img'));
//     const filtered = filteredImages(characterMap);
//     // 計算總需配的數量
//     const rows = Array.from(document.querySelectorAll('.ban-zone__rows .grid__row'));
//     let totalNeeded = 0;
//     rows.forEach(row => {
//         totalNeeded += Math.floor(row.querySelectorAll('.grid-item__drop-zone').length / 2);
//     });

//     if (filtered.length < totalNeeded) {
//         console.error(`[Filter] 篩選後圖片不足，需 ${totalNeeded} 張，僅有 ${filtered.length}`);
//         return;
//     }

//     const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, totalNeeded);
//     distributeToRowsPerVisualRow(selected, side, characterMap, socket);
// }