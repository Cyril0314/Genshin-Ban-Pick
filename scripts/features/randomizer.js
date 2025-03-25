import { originalImageSrc, getWishImagePath } from '../utils/imageUtils.js';

/**
 * 隨機分配圖片至四行：前兩行是四星，後兩行是五星
 */
export function randomizeImages(characterMap) {
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

    distributeImagesToDropZones(shuffled5, shuffled4, characterMap);
}

/**
 * 分配到主欄位四行：前後五星、中間四星
 */
function distributeImagesToDropZones(fiveStars, fourStars, characterMap) {
    const zones = document.querySelectorAll('.grid-item.drop-zone');

    [0, 3].forEach(row => {
        for (let i = 0; i < 8; i++) {
            const img = fiveStars.shift();
            updateAndAppend(img, zones[row * 8 + i], characterMap);
        }
    });

    [1, 2].forEach(row => {
        for (let i = 0; i < 8; i++) {
            const img = fourStars.shift();
            updateAndAppend(img, zones[row * 8 + i], characterMap);
        }
    });
}

/**
 * 處理 Utility 隨機功能
 */
export function handleUtilityRandom(characterMap) {
    const mainCarryType = 0;  // 假設用來篩選某一類角色
    const images = Array.from(document.querySelectorAll('#image-options img'));

    const filtered = images.filter(img => {
        const char = characterMap[img.id];
        return char?.type === mainCarryType && char.rarity === "5 Stars";
    });

    const zone = Array.from(document.querySelectorAll('.grid-column-center .drop-zone'))
        .find(z => !z.querySelector('img'));

    if (!zone || filtered.length === 0) return;

    const selected = filtered.sort(() => 0.5 - Math.random())[0];
    updateAndAppend(selected, zone, characterMap);
}

/**
 * 工具：更新圖片、改 wish 版本、放入 zone
 */
function updateAndAppend(img, zone, characterMap) {
    const imgId = img.id;
    originalImageSrc[imgId] = img.src;

    if (characterMap[imgId]) {
        img.src = getWishImagePath(imgId);
    }

    zone.appendChild(img);
}