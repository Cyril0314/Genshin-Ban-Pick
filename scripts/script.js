import { utilityTexts, banTexts, pickTexts } from './constants/constants.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    const originalImageSrc = {};  // 原始圖片路徑
    var characterMap;
    
    // 初始化函數
    initializeApp();

    // 初始化應用程式
    function initializeApp() {
        createImageElementsAndMap((map) => {
            characterMap = map;
        });
        addDropZonesToCenterColumn(utilityTexts.length);
        addDropZonesToColumns(pickTexts.length / 4);
        addDropZonesToRow(banTexts.length);
        setupResetButton();
        setupRandomizeButton();
        setupFilterButton();
        setupLeftConfirmButton();
        setupRightConfirmButton();
        setupDragAndDrop();
        setupClick();
    }

    // 設置重置按鈕
    function setupResetButton() {
        const resetButton = document.getElementById('resetButton');
        resetButton.addEventListener('click', () => {
            console.log('Reset button clicked');
            resetImages();
        });
    }

    // 設置隨機分配按鈕
    function setupRandomizeButton() {
        const randomizeButton = document.getElementById('randomizeButton');
        randomizeButton.addEventListener('click', () => {
            console.log('Random button clicked');
            randomizeImages();
        });
    }

    // 設置篩選按鈕
    function setupFilterButton() {
        const filterButton = document.getElementById('filterButton');
        filterButton.addEventListener('click', () => {
            console.log('Filter button clicked');
            
        });
    }
    
    // 設置左側選擇器的確認按鈕
    function setupLeftConfirmButton() {
        const button = document.getElementById('left-confirm-button');
        button.addEventListener('click', () => {
            handleSelection('left');
        });
    }

    // 設置右側選擇器的確認按鈕
    function setupRightConfirmButton() {
        const button = document.getElementById('right-confirm-button');
        button.addEventListener('click', () => {
            handleSelection('right');
        });
    }

    // 設置拖拽和放置功能
    function setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => handleDragStart(e));
        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => setupDropZone(zone));
    }

    // 設置點擊功能
    function setupClick() {
        document.addEventListener('click', e => {
            if (e.target.tagName === 'IMG' && e.target.parentElement.classList.contains('drop-zone')) {
                const imgId = e.target.id.replace('_clone', '');
                e.target.src = originalImageSrc[imgId] || e.target.src;  // 恢復原始圖片
                imageOptions.appendChild(e.target);  // 圖片移回選擇區
            }
        });
    }
    
    const gridItems = document.querySelectorAll('.grid-row .grid-item-row');

    gridItems.forEach((item, index) => {
        let middle = gridItems.length / 2;
        let left = Math.floor(middle / 2);
        let right = gridItems.length - left
        if (index + 1 == middle || (index + 1 == left && middle != 1) || (index + 1 == right && middle != 1)) {
            item.style.marginRight = '20px';
            let style = document.createElement('style');
            document.head.appendChild(style);
            let sheet = style.sheet;
            sheet.insertRule(`.grid-row .grid-item-row:nth-child(${index + 1})::after {
                content: '';
                position: absolute;
                left: 100%;
                transform: translateX(12.5px);
                top: 0;
                bottom: 0;
                border-right: 2px solid #4e4040;
                height: calc(100%);
            }`, 0);
        }
    });

    const imageOptions = document.getElementById('image-options');

    // 重置圖片到原始位置
    function resetImages() {
        const placedImages = document.querySelectorAll('.drop-zone img');
        placedImages.forEach(img => {
            const imgId = img.id.replace('_clone', '');
            img.src = originalImageSrc[imgId] || img.src;  // 恢復原始圖片
            img.id = imgId;
            document.getElementById('image-options').appendChild(img);  // 將圖片移回選擇器
        });
    }

    // 隨機分配圖片
    function randomizeImages() {
        const images = Array.from(document.querySelectorAll('#image-options img'));
        if (images.length < 32) {
            console.error('Not enough images to select from.');
            return;
        }
        
        // 將圖片按星級分類
        const fiveStarImages = [];
        const fourStarImages = [];

        images.forEach(image => {
            const imgId = image.id;
            const character = characterMap[imgId];
            if (character && character.name !== 'Traveler' && character.rarity === "5 Stars") {
                fiveStarImages.push(image);
            } else if (character && character.rarity === "4 Stars") {
                fourStarImages.push(image);
            }
        });

        // 隨機打亂圖片順序
        const shuffledFiveStarImages = fiveStarImages.sort(() => 0.5 - Math.random());
        const shuffledFourStarImages = fourStarImages.sort(() => 0.5 - Math.random());

        // 確保有足夠的圖片進行分配
        if (shuffledFiveStarImages.length < 16 || shuffledFourStarImages.length < 16) {
            console.error('Not enough images to distribute according to the rules.');
            return;
        }

        // 分配圖片到 drop zones
        distributeImagesToDropZones(shuffledFiveStarImages, shuffledFourStarImages);
    }    

    // 處理拖拽開始的事件
    function handleDragStart(e) {
        const imageOptions = document.getElementById('image-options');
        if (e.target.tagName === 'IMG' && imageOptions.contains(e.target)) {
            const imgId = e.target.id;
            originalImageSrc[imgId] = e.target.src;  // 存儲原始圖片路徑
            e.dataTransfer.setData('text/plain', imgId);
        }
    }

    // 設置每個 drop zone 的事件
    function setupDropZone(zone) {
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', (e) => handleDrop(e, zone));
    }

    // 處理圖片放置的事件
    function handleDrop(e, zone) {
        e.preventDefault();
        const draggedImgId = e.dataTransfer.getData('text/plain');
        const draggedImg = document.getElementById(draggedImgId);
        if (draggedImg && !zone.querySelector('img')) {
            if (characterMap[draggedImgId]) {
                draggedImg.src = getWishImagePath(draggedImgId);
            }
            zone.appendChild(draggedImg);
        }
    }

    // 分配圖片到指定的 drop zone
    function distributeImagesToDropZones(fiveStarImages, fourStarImages) {
        // 獲取所有的 drop-zone 元素
        const dropZones = document.querySelectorAll('.grid-item.drop-zone');

        // 第一行和第四行分配五星圖片
        [0, 3].forEach(row => {
            for (let i = 0; i < 8; i++) {
                const image = fiveStarImages.shift(); // 取出一張五星圖片
                const imgId = image.id;
                originalImageSrc[imgId] = image.src;

                if (characterMap[imgId]) {
                    image.src = getWishImagePath(imgId);
                }

                const dropZone = dropZones[row * 8 + i];
                dropZone.appendChild(image);
            }
        });

        // 第二行和第三行分配四星圖片
        [1, 2].forEach(row => {
            for (let i = 0; i < 8; i++) {
                const image = fourStarImages.shift(); // 取出一張四星圖片
                const imgId = image.id;
                originalImageSrc[imgId] = image.src;

                if (characterMap[imgId]) {
                    image.src = getWishImagePath(imgId);
                }

                const dropZone = dropZones[row * 8 + i];
                dropZone.appendChild(image);
            }
        });
    }

    // 創建圖片元素和角色映射
    function createImageElementsAndMap(callback) {
        const container = document.getElementById('image-options');
        let map = {};
        fetch('/api/characters')
            .then(response => response.json())
            .then(characters => {
                characters.forEach(character => {
                    let name = character.name;
                    let profileImage = getProfileImagePath(name);
                    const img = document.createElement('img');
                    img.src = profileImage;
                    img.draggable = true;
                    img.id = `${name}`;
                    container.appendChild(img);
                    map[`${name}`] = character;  // 存儲角色信息
                });
                callback(map);
            })
            .catch(error => console.error('Error loading images:', error));
    }

    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log data to console for debugging
            // Display data on the page
            // dataContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // dataContainer.innerHTML = 'Failed to load data.';
        });

    fetch('/api/characters')
    .then(response => response.json())
    .then(characters => {
        console.log(characters);
        characters.forEach ( character => {

            console.log(character.name);

        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        // dataContainer.innerHTML = 'Failed to load data.';
    });

    function addDropZonesToCenterColumn(numDropZones) {
        const columns = document.querySelectorAll('.grid-column-center');
        columns.forEach(column => {
            let currentColumn = document.createElement('div');
            currentColumn.style.display = 'inline-block';
            currentColumn.style.verticalAlign = 'top';
    
            let itemsInColumn = 0;
    
            for (let i = 0; i < numDropZones; i++) {
                const dropZone = document.createElement('div');
                dropZone.className = 'grid-item-center drop-zone';
                dropZone.style.width = '160px';  
                dropZone.style.height = '90px'; 
                dropZone.style.margin = '5px';  
    
                const span = document.createElement('span');
                span.className = 'utility-text';
                span.textContent = "Utility";
                dropZone.appendChild(span);
    
                currentColumn.appendChild(dropZone);
                itemsInColumn++;
    
                // 每列达到6个元素后，创建新的列
                if (itemsInColumn === 4) {
                    column.appendChild(currentColumn);
                    currentColumn = document.createElement('div');
                    currentColumn.style.display = 'inline-block';
                    currentColumn.style.verticalAlign = 'top';
                    itemsInColumn = 0;
                }
            }
    
            // 添加最后一列（如果有剩余元素）
            if (itemsInColumn > 0) {
                column.appendChild(currentColumn);
            }
        });
    }

    // 添加 drop zones 到行
    function addDropZonesToRow(numDropZones) {
        const row = document.querySelector('.grid-row');
        for (let i = 0; i < numDropZones; i++) {
            const dropZone = document.createElement('div');
            dropZone.className = 'grid-item-row drop-zone';
            const span = document.createElement('span');
            span.className = 'ban-text';
            span.textContent = banTexts[i];
            dropZone.appendChild(span);
            row.appendChild(dropZone);
        }
    }

    function addDropZonesToColumns(numDropZones) {
        const columns = document.querySelectorAll('.grid-column');
        
        for (let i = 0; i < columns.length; i++) {
            // 為每列創建特定數量的 drop-zone
            for (let j = 0; j < numDropZones; j++) {
                const dropZone = createDropZone('pick-text',pickTexts[i * numDropZones + j]);
                columns[i].appendChild(dropZone);
            }
        }
    }

     // 創建 drop zone 的通用函數
     function createDropZone(textClass, textContent) {
        const dropZone = document.createElement('div');
        dropZone.className = 'grid-item drop-zone';
        const span = document.createElement('span');
        span.className = textClass;
        span.textContent = textContent;
        dropZone.appendChild(span);
        return dropZone;
    }

    function getProfileImagePath(imgId) {
        const basePath = 'images/';
        let nameWithoutSpaces = imgId.replace(/\s+/g, '');
        let image = basePath + nameWithoutSpaces + '_Profile.webp';
        return image;
    }
    
    function getWishImagePath(imgId) {
        const basePath = 'images/wish-images/';
        let nameWithoutSpaces = imgId.replace(/\s+/g, '');
        let image = basePath + nameWithoutSpaces + '_Wish.png';
        return image;
    }

    // 處理選擇邏輯
    function handleSelection(side) {
        const weaponSelect = document.getElementById(`${side}-weapon-select`).value;
        const elementSelect = document.getElementById(`${side}-element-select`).value;
        const images = Array.from(document.querySelectorAll('#image-options img'));
        
        // 過濾符合條件的角色圖片
        const filteredImages = images.filter(image => {
            const character = characterMap[image.id];
            if (character) {
                const matchesWeapon = (weaponSelect === 'All' || character.weapon === weaponSelect);
                const matchesElement = (elementSelect === 'All' || character.element === elementSelect);
                return (matchesWeapon || matchesElement) && character.name !== 'Traveler';
            }
            return false;
        });

        if (filteredImages.length < 4) {
            console.error('Not enough characters match the selected criteria.');
            return;
        }

        // 隨機選擇四個圖片
        const selectedImages = filteredImages.sort(() => 0.5 - Math.random()).slice(0, 4);

        // 分配圖片到指定的 drop zone
        distributeImagesToRow(selectedImages, side);
    }

    // 分配圖片到指定的 grid-row 的格子中
    function distributeImagesToRow(images, side) {
        const gridRow = document.querySelector('.grid-row');
        const gridItems = gridRow.children;

        if (side === 'left') {
            // 左側條件分配到左邊格子
            for (let i = 0; i < 4 && i < images.length; i++) {
                const imgId = images[i].id;
                originalImageSrc[imgId] = images[i].src;

                if (characterMap[imgId]) {
                    images[i].src = getWishImagePath(imgId);
                }

                const dropZone = gridItems[i];
                dropZone.innerHTML = ''; // 清空之前的内容
                dropZone.appendChild(images[i]);
            }
        } else if (side === 'right') {
            // 右側條件分配到右邊格子
            for (let i = 4; i < 8 && i - 4 < images.length; i++) {
                const imgId = images[i - 4].id;
                originalImageSrc[imgId] = images[i - 4].src;

                if (characterMap[imgId]) {
                    images[i - 4].src = getWishImagePath(imgId);
                }

                const dropZone = gridItems[i];
                dropZone.innerHTML = ''; // 清空之前的内容
                dropZone.appendChild(images[i - 4]);
            }
        }
    }
});