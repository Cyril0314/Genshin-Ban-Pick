// src/utils/imageRegistry.ts

const profileImages = import.meta.glob('@/assets/images/profile/*.webp', {
    eager: true,
    import: 'default'
})

const wishImages = import.meta.glob('@/assets/images/wish/*.png', {
    eager: true,
    import: 'default'
})

export function getProfileImagePath(characterId: string): string | undefined {
    const key = `/src/assets/images/profile/${characterId.replace(/\s+/g, '')}_Profile.webp`
    return profileImages[key] as string | undefined
}

export function getWishImagePath(characterId: string): string | undefined {
    const key = `/src/assets/images/wish/${characterId.replace(/\s+/g, '')}_Wish.png`
    return wishImages[key] as string | undefined
}