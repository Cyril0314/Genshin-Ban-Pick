// scripts/ui/setupSelectors.js

export function setupSelectors(characterMap) {
    const characters = Object.values(characterMap);
    const selectorsData = [
        { className: 'rarity', label: '選擇星級', items: uniqueByKey(characters, 'rarity', rarityOrder), translateFn: translateRarity },
        { className: 'wish', label: '選擇祈願', items: uniqueByKey(characters, 'wish', wishOrder), translateFn: translateWish },
        { className: 'role', label: '選擇功能', items: uniqueByKey(characters, 'role', roleOrder), translateFn: translateRole },
        { className: 'element', label: '選擇屬性', items: uniqueByKey(characters, 'element', elementOrder), translateFn: translateElement },
        { className: 'weapon', label: '選擇武器', items: uniqueByKey(characters, 'weapon', weaponOrder), translateFn: translateWeapon },
        { className: 'region', label: '選擇國家', items: uniqueByKey(characters, 'region', regionOrder), translateFn: translateRegion },
        { className: 'model-type', label: '選擇體型', items: uniqueByKey(characters, 'model_type', modelTypeOrder), translateFn: translateModelType },
    ];
    const container = document.querySelector('.container__selector');
    selectorsData.forEach(({ className, label, items, translateFn = (v) => v }) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'selector__row';

        const labelEl = document.createElement('label');
        labelEl.className = 'selector__label';
        labelEl.textContent = `${label}：`;

        const selectEl = document.createElement('select');
        selectEl.className = `selector__select selector__select--${className}`;

        // 加入「所有」選項
        selectEl.appendChild(new Option('所有', 'All'));

        // 動態加入其他選項
        items.forEach(item => {
            selectEl.appendChild(new Option(translateFn(item), item));
        });

        rowDiv.appendChild(labelEl);
        rowDiv.appendChild(selectEl);

        const childrenCount = container.children.length;
        if (childrenCount >= 1) {
            container.insertBefore(rowDiv, container.children[childrenCount - 1]);
        } else {
            container.appendChild(rowDiv);
        }
    });
}

// 去除重複並排序
function uniqueByKey(data, key, orderArray = []) {
    const uniqueSet = new Set(data.map(item => item[key]));
    if (orderArray.length === 0) {
        // 若未提供特定順序，則仍然字母排序
        return [...uniqueSet].sort();
    }

    // 按照 orderArray 中指定的順序排序
    return orderArray.filter(item => uniqueSet.has(item));
}

function translateWeapon(weapon) {
    const translations = {
        "Sword": "單手劍",
        "Claymore": "雙手劍",
        "Polearm": "長槍",
        "Bow": "弓",
        "Catalyst": "法器"
    };
    return translations[weapon] || weapon;
}

function translateElement(element) {
    const translations = {
        "Anemo": "風",
        "Geo": "岩",
        "Electro": "雷",
        "Dendro": "草",
        "Hydro": "水",
        "Pyro": "火",
        "Cryo": "冰",
        "None": "無屬性"
    };
    return translations[element] || element;
}

function translateRegion(region) {
    const translations = {
        "Mondstadt": "蒙德",
        "Liyue": "璃月",
        "Inazuma": "稻妻",
        "Sumeru": "須彌",
        "Fontaine": "楓丹",
        "Natlan": "納塔",
        "Snezhnaya": "至冬",
        "None": "無所屬"
    };
    return translations[region] || region;
}

function translateRarity(rarity) {
    const translations = {
        "5 Stars": "5★",
        "4 Stars": "4★",
    };
    return translations[rarity] || rarity;
}

function translateModelType(modelType) {
    const translations = {
        "Tall Male": "成男",
        "Tall Female": "成女",
        "Medium Male": "少年",
        "Medium Female": "少女",
        "Short Female": "幼女",
        "None": "旅行者"
    };
    return translations[modelType] || modelType;
}

function translateRole(role) {
    const translations = {
        "Main DPS": "主C",
        "Sub DPS": "副C",
        "Support": "輔助",
    };
    return translations[role] || role;
}

function translateWish(wish) {
    const translations = {
        "Limited-Time Event Wish": "限定",
        "Standard Wish": "常駐",
        "None": "旅行者",
    };
    return translations[wish] || wish;
}

const weaponOrder = [
    "Sword",
    "Claymore",
    "Polearm",
    "Bow",
    "Catalyst"
];

const elementOrder = [
    "Anemo",
    "Geo",
    "Electro",
    "Dendro",
    "Hydro",
    "Pyro",
    "Cryo",
    "None"
];

const regionOrder = [
    "Mondstadt",
    "Liyue",
    "Inazuma",
    "Sumeru",
    "Fontaine",
    "Natlan",
    "Snezhnaya",
    "None"
];

const rarityOrder = [
    "5 Stars",
    "4 Stars"
];

const modelTypeOrder = [
    "Tall Male",
    "Tall Female",
    "Medium Male",
    "Medium Female",
    "Short Female",
    "None"
];

const roleOrder = [
    "Main DPS",
    "Sub DPS",
    "Support",
];

const wishOrder = [
    "Limited-Time Event Wish",
    "Standard Wish",
    "None",
];