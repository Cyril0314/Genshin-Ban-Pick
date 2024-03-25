document.addEventListener('DOMContentLoaded', () => {
    const imageOptions = document.getElementById('image-options');
    const dropZones = document.querySelectorAll('.drop-zone');

    const dropZonesTopRow = document.querySelectorAll('.grid-row .drop-zone');
    const banTexts = ["Ban 12", "Ban 10", "Ban 7", "Ban 5", "Ban 3", "Ban 1", "Ban 2", "Ban 4", "Ban 6", "Ban 8", "Ban 9", "Ban 11"];

    const dropZonesColums = document.querySelectorAll('.grid-column .drop-zone');
    const pickTexts = ["Pick 2", "Pick 3", "Pick 6", "Pick 7", "Pick 9", "Pick 12", "Pick 13", "Pick 16", "Pick 1", "Pick 4", "Pick 5", "Pick 8", "Pick 10", "Pick 11", "Pick 14", "Pick 15"];

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

    // 允许拖放
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => e.preventDefault());

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            const draggedImg = document.getElementById(data);

            if (draggedImg) {
                // 检查是否已有图片，如果有，先移回选择器
                const existingImg = zone.querySelector('img');
                if (existingImg) {
                    imageOptions.appendChild(existingImg); // 移回选择器
                }

                // 如果是从选择器中拖拽的图片，将其克隆到方格中
                if (imageOptions.contains(draggedImg)) {
                    const newImg = draggedImg.cloneNode();
                    newImg.id = `${draggedImg.id}_clone`; // 给克隆的图片一个新的ID
                    zone.appendChild(newImg);
                    draggedImg.remove(); // 从选择器中移除原图片
                } else {
                    // 否则直接移动图片到新方格
                    zone.appendChild(draggedImg);
                }
            }
        });
    });
});
