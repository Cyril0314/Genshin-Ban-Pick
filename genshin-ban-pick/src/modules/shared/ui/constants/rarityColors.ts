// src/modules/shared/ui/constants/rarityColors.ts

import { Rarity } from '@shared/contracts/character/value-types';

// 沿用抽卡介面慣例：5★ 金、4★ 紫
export const rarityColors = {
    [Rarity.FiveStar]: '#E0A23B',
    [Rarity.FourStar]: '#9B6FD4',
} as const;
