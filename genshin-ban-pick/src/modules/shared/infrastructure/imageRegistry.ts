// src/modules/shared/infrastructure/imageRegistry.ts

const profileImages = import.meta.glob('@/assets/images/profile/*.webp', {
    eager: true,
    import: 'default',
});

const wishImages = import.meta.glob('@/assets/images/wish/*.png', {
    eager: true,
    import: 'default',
});

export function getProfileImagePath(characterKey: string): string | undefined {
    const key = `/src/assets/images/profile/${toPascalCase(characterKey)}_Profile.webp`;
    return profileImages[key] as string | undefined;
}

export function getWishImagePath(characterKey: string): string | undefined {
    const key = `/src/assets/images/wish/${toPascalCase(characterKey)}_Wish.png`;
    return wishImages[key] as string | undefined;
}

function toPascalCase(key: string): string {
    return key
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
