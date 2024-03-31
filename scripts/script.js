document.addEventListener('DOMContentLoaded', () => {
    const imageOptions = document.getElementById('image-options');
    const dropZones = document.querySelectorAll('.drop-zone');

    const dropZonesTopRow = document.querySelectorAll('.grid-row .drop-zone');
    const banTexts = ["Ban 16", "Ban 14", "Ban 12", "Ban 9", "Ban 7", "Ban 5", "Ban 3", "Ban 1", "Ban 2", "Ban 4", "Ban 6", "Ban 8", "Ban 10", "Ban 11", "Ban 13", "Ban 15"];

    const dropZonesColums = document.querySelectorAll('.grid-column .drop-zone');
    const pickTexts = ["Pick 2", "Pick 3", "Pick 6", "Pick 7", "Pick 9", "Pick 12", "Pick 13", "Pick 16", "Pick 1", "Pick 4", "Pick 5", "Pick 8", "Pick 10", "Pick 11", "Pick 14", "Pick 15"];
    const resetButton = document.getElementById('resetButton');

    // 为一键清除按钮添加点击事件监听
    resetButton.addEventListener('click', () => {
        // 获取所有已经放置在方格中的图片
        const placedImages = document.querySelectorAll('.drop-zone img');

        // 遍历所有图片，将它们移回图片选择器
        placedImages.forEach(img => {
            // 重置图片的ID，去除可能的_clone后缀
            const originalId = img.id.replace('_clone', '');
            img.id = originalId;

            // 将图片移回图片选择器
            imageOptions.appendChild(img);
        });
    });

    // 给顶部的12个方格的 .ban-text <span> 分别添加文本
    dropZonesTopRow.forEach((zone, index) => {
        const span = zone.querySelector('.ban-text');
        span.textContent = banTexts[index]; // 设置文本
    });

    // 给左右的16个方格的 .pick-text <span> 分别添加文本
    dropZonesColums.forEach((zone, index) => {
        const span = zone.querySelector('.pick-text');
        span.textContent = pickTexts[index]; // 设置文本
    });

    // 处理拖拽开始
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG' && imageOptions.contains(e.target)) {
            e.dataTransfer.setData('text/plain', e.target.id);
        }
    });

    // 处理图片点击，移回图片选择器
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && e.target.parentElement.classList.contains('drop-zone')) {
            // 移动点击的图片回到选择器
            imageOptions.appendChild(e.target);
        }
    });

    // 設置放置區的拖放事件
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', e => {
            e.preventDefault();
            const draggedImgId = e.dataTransfer.getData('text/plain');
            const draggedImg = document.getElementById(draggedImgId);
            handleImageDrop(e, draggedImg, zone);
        });
    });

    // 處理圖片放置的函數
    function handleImageDrop(event, draggedImg, dropZone) {
        // 檢查放置區是否已有圖片
        const existingImg = dropZone.querySelector('img');
        if (existingImg) {
            imageOptions.appendChild(existingImg); // 如果有，移回選擇器
        }
        // 將圖片放置到放置區
        if (draggedImg) {
            if (imageOptions.contains(draggedImg)) {
                const newImg = draggedImg.cloneNode();
                newImg.id = `${draggedImg.id}_clone`; // 給克隆的圖片一個新的ID
                dropZone.appendChild(newImg);
                draggedImg.remove(); // 從選擇器中移除原圖片
            } else {
                // 直接移動圖片到新放置區
                dropZone.appendChild(draggedImg);
            }
        }
    }
});
