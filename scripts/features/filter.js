// scripts/features/filter.js

export function filteredImages(characterMap) {
    const weapon = document.querySelector(`.selector__select--weapon`).value;
    const element = document.querySelector(`.selector__select--element`).value;
    const region = document.querySelector(`.selector__select--region`).value;
    const rarity = document.querySelector(`.selector__select--rarity`).value;
    const modelType = document.querySelector(`.selector__select--model-type`).value;
    const role = document.querySelector(`.selector__select--role`).value;
    const wish = document.querySelector(`.selector__select--wish`).value;

    const filters = {
        weapon: weapon,
        element: element,
        region: region,
        rarity: rarity,
        model_type: modelType,
        role: role,
        wish: wish
    };

    console.log(`filters ${JSON.stringify(filters, null, 2)}`)

    const images = Array.from(document.querySelectorAll('#image-options img'));

    const filtered = images.filter(img => {
        const char = characterMap[img.id];
        if (!char) return false;

        return Object.entries(filters).every(([key, value]) => {
            return value === 'All' || char[key] === value;
        });
    });

    // 測試結果
    console.log(filtered);

    return filtered;
}