import { updateAndBroadcastImage } from '../utils/syncUtils.js';
import { stepController } from '../logic/stepController.js';

/**
 * 隨機分配圖片至四行：前兩行是四星，後兩行是五星
 */
export function randomizeImages(characterMap, socket) {
    const images = Array.from(document.querySelectorAll('#image-options img'));
    if (images.length < 32) {
        console.error('Not enough images to select from.');
        return;
    }

    const fiveStar = [], fourStar = [];

    images.forEach(image => {
        const char = characterMap[image.id];
        if (!char || char.name === 'Traveler') return;

        if (char.rarity === "5 Stars") fiveStar.push(image);
        else if (char.rarity === "4 Stars") fourStar.push(image);
    });

    if (fiveStar.length < 16 || fourStar.length < 16) {
        console.error('Insufficient 5★ or 4★ characters for random distribution');
        return;
    }

    const shuffled5 = fiveStar.sort(() => 0.5 - Math.random());
    const shuffled4 = fourStar.sort(() => 0.5 - Math.random());

    distributeImagesToDropZones(shuffled5, shuffled4, characterMap, socket);
}

/**
 * 分配到主欄位四行：前後五星、中間四星
 */
function distributeImagesToDropZones(fiveStars, fourStars, characterMap, socket) {
    const zones = document.querySelectorAll('.grid-item__drop-zone--pick');

    [0, 3].forEach(row => {
        for (let i = 0; i < 8; i++) {
            const img = fiveStars.shift();
            updateAndBroadcastImage(img, zones[row * 8 + i], characterMap, socket);
        }
    });

    [1, 2].forEach(row => {
        for (let i = 0; i < 8; i++) {
            const img = fourStars.shift();
            updateAndBroadcastImage(img, zones[row * 8 + i], characterMap, socket);
        }
    });
}

/**
 * 處理 Utility 隨機功能
 */
export function handleUtilityRandom(characterMap, socket) {
    const mainCarryType = 0;  // 假設用來篩選某一類角色
    const images = Array.from(document.querySelectorAll('#image-options img'));

    const filtered = images.filter(img => {
        const char = characterMap[img.id];
        return char?.type === mainCarryType && char.rarity === "5 Stars";
    });

    const zone = Array.from(document.querySelectorAll('.utility-zone__columns .grid-item__drop-zone'))
        .find(z => !z.querySelector('img'));

    if (!zone || filtered.length === 0) return;

    const selected = filtered.sort(() => 0.5 - Math.random())[0];
    updateAndBroadcastImage(selected, zone, characterMap, socket);
}

/**
 * 處理 Ban 隨機功能
 */
export function handleBanRandom(characterMap, roomSetting, socket) {
    // const mainCarryType = 0;  // 假設用來篩選某一類角色
    const images = Array.from(document.querySelectorAll('#image-options img'));

    // 篩選出 5★ 角色圖片
    const fiveStarImages = images.filter(img => {
        const char = characterMap[img.id];
        return char.rarity === "5 Stars";
    });

    const banZones = Array.from(document.querySelectorAll('.ban-zone__rows .grid-item__drop-zone'))
    // 找出下一個 ban 的步驟（找到尚未放置圖片的 ban zone）
    const nextBanStep = roomSetting.banPickFlow.find(step => {
        if (step.action !== "ban") return false;
        const zone = banZones.find(z => z.dataset.zoneId === `zone-${step.zoneId}`);
        return zone && !zone.querySelector('img');
    });
    // 如果沒有下一個 ban 步驟，或沒有 5★ 圖片，則不處理
    if (!nextBanStep || fiveStarImages.length === 0) return;

    // 取得對應的 ban zone
    const targetBanZone = banZones.find(z => z.dataset.zoneId === `zone-${nextBanStep.zoneId}`);
    if (!targetBanZone) return;

    const selected = fiveStarImages.sort(() => 0.5 - Math.random())[0];
    updateAndBroadcastImage(selected, targetBanZone, characterMap, socket);
    
    if (stepController.isCurrentZone(targetBanZone.dataset.zoneId)) {
        socket.emit('step.advance.request', {
            senderId: socket.id
        });
    }
}