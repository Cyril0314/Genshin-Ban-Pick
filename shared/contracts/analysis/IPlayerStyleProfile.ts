import type { ICharacterAttributeDistributions } from "./character/ICharacterAttributeDistributions";

export interface IPlayerStyleProfile {
    versatility: number; // 0-100
    metaAffinity: number; // 0-100
    roleAdjustedDiversity: number; // 0-100
    elementAdjustedDiversity: number; // 0-100
    weaponAdjustedDiversity: number; // 0-100
    modelTypeAdjustedDiversity: number; // 0-100
    regionAdjustedDiversity: number; // 0-100
    rarityAdjustedDiversity: number; // 0-100
    characterAttributeDistributions: ICharacterAttributeDistributions
}
