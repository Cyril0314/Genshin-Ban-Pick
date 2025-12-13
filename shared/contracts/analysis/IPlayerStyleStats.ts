export interface IPlayerStyleStats {
    versatility: number; // 0-100
    metaAffinity: number; // 0-100
    roleAdjustedDiversity: number; // 0-100
    elementAdjustedDiversity: number; // 0-100
    weaponAdjustedDiversity: number; // 0-100
    modelTypeAdjustedDiversity: number; // 0-100
    regionAdjustedDiversity: number; // 0-100
    rarityAdjustedDiversity: number; // 0-100
    playerRoleCounts: Record<string, number>, 
    playerElementCounts: Record<string, number>,
    playerWeaponCounts: Record<string, number>,
    playerModelTypeCounts: Record<string, number>,
    playerRegionCounts: Record<string, number>,
    playerRarityCounts: Record<string, number>,
}
