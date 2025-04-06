export const originalImageSrc = {};

export function getProfileImagePath(name) {
    return `images/${name.replace(/\s+/g, '')}_Profile.webp`;
}

export function getWishImagePath(name) {
    return `images/wish-images/${name.replace(/\s+/g, '')}_Wish.png`;
}

export function resetImages() {
    const imageOptions = document.getElementById('image-options');
    const placedImages = document.querySelectorAll('.grid-item__drop-zone img');

    placedImages.forEach(img => {
        const imgId = img.id;
        img.src = originalImageSrc[imgId] || img.src;
        img.id = imgId;
        imageOptions.appendChild(img);
    });
}