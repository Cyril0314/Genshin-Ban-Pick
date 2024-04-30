document.addEventListener('DOMContentLoaded', () => {
    const imageOptions = document.getElementById('image-options');
    const dropZones = document.querySelectorAll('.drop-zone');
    const originalImageSrc = {};  // 用于存储原始图片路径

    const imageMap = {
        'Albedo_Profile': 'images/wish-images/Albedo_Wish.png',
        'Alhaitham_Profile': 'images/wish-images/Alhaitham_Wish.png',
        'Amber_Profile': 'images/wish-images/Amber_Wish.png',
        'Arataki_Itto_Profile': 'images/wish-images/Arataki_Itto_Wish.png',
        'Arlecchino_Profile': 'images/wish-images/Arlecchino_Wish.png',
        'Baizhu_Profile': 'images/wish-images/Baizhu_Wish.png',
        'Barbara_Profile': 'images/wish-images/Barbara_Wish.png',
        'Beidou_Profile': 'images/wish-images/Beidou_Wish.png',
        'Bennett_Profile': 'images/wish-images/Bennett_Wish.png',
        'Candace_Profile': 'images/wish-images/Candace_Wish.png',
        'Charlotte_Profile': 'images/wish-images/Charlotte_Wish.png',
        'Chevreuse_Profile': 'images/wish-images/Chevreuse_Wish.png',
        'Chiori_Profile': 'images/wish-images/Chiori_Wish.png',
        'Chongyun_Profile': 'images/wish-images/Chongyun_Wish.png',
        'Collei_Profile': 'images/wish-images/Collei_Wish.png',
        'Cyno_Profile': 'images/wish-images/Cyno_Wish.png',
        'Dehya_Profile': 'images/wish-images/Dehya_Wish.png',
        'Diluc_Profile': 'images/wish-images/Diluc_Wish.png',
        'Diona_Profile': 'images/wish-images/Diona_Wish.png',
        'Dori_Profile': 'images/wish-images/Dori_Wish.png',
        'Eula_Profile': 'images/wish-images/Eula_Wish.png',
        'Faruzan_Profile': 'images/wish-images/Faruzan_Wish.png',
        'Fischl_Profile': 'images/wish-images/Fischl_Wish.png',
        'Freminet_Profile': 'images/wish-images/Freminet_Wish.png',
        'Furina_Profile': 'images/wish-images/Furina_Wish.png',
        'Gaming_Profile': 'images/wish-images/Gaming_Wish.png',
        'Ganyu_Profile': 'images/wish-images/Ganyu_Wish.png',
        'Gorou_Profile': 'images/wish-images/Gorou_Wish.png',
        'Hu_Tao_Profile': 'images/wish-images/Hu_Tao_Wish.png',
        'Jean_Profile': 'images/wish-images/Jean_Wish.png',
        'Kaedehara_Kazuha_Profile': 'images/wish-images/Kaedehara_Kazuha_Wish.png',
        'Kaeya_Profile': 'images/wish-images/Kaeya_Wish.png',
        'Kamisato_Ayaka_Profile': 'images/wish-images/Kamisato_Ayaka_Wish.png',
        'Kamisato_Ayato_Profile': 'images/wish-images/Kamisato_Ayato_Wish.png',
        'Kaveh_Profile': 'images/wish-images/Kaveh_Wish.png',
        'Keqing_Profile': 'images/wish-images/Keqing_Wish.png',
        'Kirara_Profile': 'images/wish-images/Kirara_Wish.png',
        'Klee_Profile': 'images/wish-images/Klee_Wish.png',
        'Kujou_Sara_Profile': 'images/wish-images/Kujou_Sara_Wish.png',
        'Kuki_Shinobu_Profile': 'images/wish-images/Kuki_Shinobu_Wish.png',
        'Layla_Profile': 'images/wish-images/Layla_Wish.png',
        'Lisa_Profile': 'images/wish-images/Lisa_Wish.png',
        'Lynette_Profile': 'images/wish-images/Lynette_Wish.png',
        'Lyney_Profile': 'images/wish-images/Lyney_Wish.png',
        'Mika_Profile': 'images/wish-images/Mika_Wish.png',
        'Mona_Profile': 'images/wish-images/Mona_Wish.png',
        'Nahida_Profile': 'images/wish-images/Nahida_Wish.png',
        'Navia_Profile': 'images/wish-images/Navia_Wish.png',
        'Neuvillette_Profile': 'images/wish-images/Neuvillette_Wish.png',
        'Nilou_Profile': 'images/wish-images/Nilou_Wish.png',
        'Ningguang_Profile': 'images/wish-images/Ningguang_Wish.png',
        'Noelle_Profile': 'images/wish-images/Noelle_Wish.png',
        'Qiqi_Profile': 'images/wish-images/Qiqi_Wish.png',
        'Raiden_Shogun_Profile': 'images/wish-images/Raiden_Shogun_Wish.png',
        'Razor_Profile': 'images/wish-images/Razor_Wish.png',
        'Rosaria_Profile': 'images/wish-images/Rosaria_Wish.png',
        'Sangonomiya_Kokomi_Profile': 'images/wish-images/Sangonomiya_Kokomi_Wish.png',
        'Sayu_Profile': 'images/wish-images/Sayu_Wish.png',
        'Shenhe_Profile': 'images/wish-images/Shenhe_Wish.png',
        'Shikanoin_Heizou_Profile': 'images/wish-images/Shikanoin_Heizou_Wish.png',
        'Sucrose_Profile': 'images/wish-images/Sucrose_Wish.png',
        'Tartaglia_Profile': 'images/wish-images/Tartaglia_Wish.png',
        'Thoma_Profile': 'images/wish-images/Thoma_Wish.png',
        'Tighnari_Profile': 'images/wish-images/Tighnari_Wish.png',
        'Traveler_Profile': 'images/wish-images/Traveler_Wish.png',
        'Venti_Profile': 'images/wish-images/Venti_Wish.png',
        'Wanderer_Profile': 'images/wish-images/Wanderer_Wish.png',
        'Wriothesley_Profile': 'images/wish-images/Wriothesley_Wish.png',
        'Xiangling_Profile': 'images/wish-images/Xiangling_Wish.png',
        'Xianyun_Profile': 'images/wish-images/Xianyun_Wish.png',
        'Xiao_Profile': 'images/wish-images/Xiao_Wish.png',
        'Xingqiu_Profile': 'images/wish-images/Xingqiu_Wish.png',
        'Xinyan_Profile': 'images/wish-images/Xinyan_Wish.png',
        'Yae_Miko_Profile': 'images/wish-images/Yae_Miko_Wish.png',
        'Yanfei_Profile': 'images/wish-images/Yanfei_Wish.png',
        'Yaoyao_Profile': 'images/wish-images/Yaoyao_Wish.png',
        'Yelan_Profile': 'images/wish-images/Yelan_Wish.png',
        'Yoimiya_Profile': 'images/wish-images/Yoimiya_Wish.png',
        'Yun_Jin_Profile': 'images/wish-images/Yun_Jin_Wish.png',
        'Zhongli_Profile': 'images/wish-images/Zhongli_Wish.png',
        // 添加更多映射关系...
    };

    const dropZonesTopRow = document.querySelectorAll('.grid-row .drop-zone');
    const banTexts = [
        // "Ban 16", 
        // "Ban 14", 
        // "Ban 12", 
        // "Ban 9", 
        // "Ban 7", 
        // "Ban 5", 
        "Ban 4",
        "Ban 1",
        "Ban 2",
        "Ban 3",
        // "Ban 6", 
        // "Ban 8", 
        // "Ban 10", 
        // "Ban 11", 
        // "Ban 13", 
        // "Ban 15"
    ];

    const dropZonesColums = document.querySelectorAll('.grid-column .drop-zone');
    const pickTexts = [
        "Pick 1",
        "Pick 4",
        "Pick 5",
        "Pick 8",
        "Pick 9",
        "Pick 12",
        "Pick 13",
        "Pick 16",
        "Pick 18",
        "Pick 19",
        "Pick 22",
        "Pick 23",
        "Pick 26",
        "Pick 27",
        "Pick 30",
        "Pick 31",
        "Pick 17",
        "Pick 20",
        "Pick 21",
        "Pick 24",
        "Pick 25",
        "Pick 28",
        "Pick 29",
        "Pick 32",
        "Pick 2",
        "Pick 3",
        "Pick 6",
        "Pick 7",
        "Pick 10",
        "Pick 11",
        "Pick 14",
        "Pick 15"
    ];

    const resetButton = document.getElementById('resetButton');

    // 为一键清除按钮添加点击事件监听
    resetButton.addEventListener('click', () => {
        const placedImages = document.querySelectorAll('.drop-zone img');
        placedImages.forEach(img => {
            const imgId = img.id.replace('_clone', '');
            img.src = originalImageSrc[imgId] || img.src;  // 恢复原始图片
            img.id = imgId;
            imageOptions.appendChild(img);  // 将图片移回选择器
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

    // 处理拖拽开始，记录原始图片路径
    document.addEventListener('dragstart', e => {
        if (e.target.tagName === 'IMG' && imageOptions.contains(e.target)) {
            const imgId = e.target.id;
            originalImageSrc[imgId] = e.target.src;  // 存储原始图片路径
            e.dataTransfer.setData('text/plain', imgId);
        }
    });

    // 设置放置区的拖放事件
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', e => {
            e.preventDefault();
            const draggedImgId = e.dataTransfer.getData('text/plain');
            const draggedImg = document.getElementById(draggedImgId);
            if (draggedImg && !zone.querySelector('img')) {

                // 检查是否是顶部行，避免替换图片
                // if (!zone.closest('.grid-row')) {
                    // 如果有映射图片且不是顶部行，则替换图片
                    if (imageMap[draggedImgId]) {
                        draggedImg.src = imageMap[draggedImgId];
                    }
                // }
                zone.appendChild(draggedImg);
            }
        });
    });

    // 图片点击事件，将图片移回选择区并恢复原始图片
    document.addEventListener('click', e => {
        if (e.target.tagName === 'IMG' && e.target.parentElement.classList.contains('drop-zone')) {
            const imgId = e.target.id.replace('_clone', '');
            e.target.src = originalImageSrc[imgId] || e.target.src;  // 恢复原始图片
            imageOptions.appendChild(e.target);  // 将图片移回选择区
        }
    });
});
