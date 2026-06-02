// src/modules/analysis/ui/composables/usePlayerStyleChart.ts

import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useUserStore } from '@/modules/user';
import { createLogger } from '@/app/utils/logger';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useMatchUseCase } from '@/modules/match';
import {
    elementTranslator,
    modelTypeTranslator,
    regionTranslator,
    roleTranslator,
    weaponTranslator,
    rarityTranslator,
} from '@/modules/shared/ui/composables/useCharacterTranslators';
import { sortByEnumOrder } from '@/modules/shared/ui/composables/useCharacterSorter';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';
import { isSameIdentity } from '@shared/contracts/identity/Identity';

import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { EnumOrderValue } from '@/modules/shared/ui/composables/useCharacterSorter';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';


const logger = createLogger('analysis.ui.playerStyleChart');

type Scope = { type: 'Player'; player: TeamMember } | { type: 'Global' };

export function usePlayerStyleChart() {
    const { tooltipStyle } = useEchartTheme();
    const designTokens = useDesignTokens();
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);

    const analysisUseCase = useAnalysisUseCase();
    const matchUseCase = useMatchUseCase();

    const players = ref<TeamMember[]>([]);

    const scopes = computed<Scope[]>(() => {
        const globalScope: Scope = { type: 'Global' };

        const playerScopes: Scope[] = players.value.map((p) => ({
            type: 'Player',
            player: p,
        }));

        return [globalScope, ...playerScopes];
    });

    const selectedScopeKey = ref<string>();

    const selectedScope = computed({
        get() {
            if (!selectedScopeKey.value) return undefined;
            return scopes.value.find((scope) => getScopeKey(scope) === selectedScopeKey.value);
        },
        set(scope) {
            selectedScopeKey.value = scope ? getScopeKey(scope) : undefined;
        },
    });

    const playerStyle = ref<IPlayerStyleProfile>();
    const characterAttributeDistributions = ref<ICharacterAttributeDistributions>();

    onMounted(async () => {
        players.value = await matchUseCase.fetchMatchTeamMembers();
        logger.debug('players loaded', players.value.length);

        const currentUser = user.value;
        const self = !currentUser
            ? undefined
            : players.value.find((player) => {
                if (player.type === 'Name') return false;
                return isSameIdentity(player, currentUser);
            });

        if (self) {
            logger.debug('self found, selecting player scope');
            selectedScope.value = { type: 'Player', player: self };
        } else {
            logger.debug('self not found, selecting global scope');
            selectedScope.value = { type: 'Global' };
        }
    });

    watch(selectedScope, async () => {
        if (!selectedScope.value) return;
        logger.debug('scope changed to', selectedScope.value.type);
        if (selectedScope.value.type === 'Player') {
            playerStyle.value = await analysisUseCase.fetchPlayerStyleProfile(selectedScope.value.player);
            characterAttributeDistributions.value = playerStyle.value?.characterAttributeDistributions;
        } else {
            characterAttributeDistributions.value = await analysisUseCase.fetchCharacterAttributeDistributions();
        }
    });

    function getScopeKey(scope: Scope): string {
        switch (scope.type) {
            case 'Global':
                return 'global';
            case 'Player':
                switch (scope.player.type) {
                    case 'Member':
                        return `member:${scope.player.id}`;
                    case 'Guest':
                        return `guest:${scope.player.id}`;
                    case 'Name':
                        return `name:${scope.player.name}`;
                }
        }
    }

    function getPieColor<K extends CharacterFilterKey>(key: K, index: number, name: EnumOrderValue<K>) {
        if (key === 'element') {
            const elementName = name as keyof typeof elementColors;
            return elementColors[elementName]?.main ?? '#999999';
        }
        return undefined;
        // return chartColors[index % chartColors.length];
    }

    function toPieSorted<K extends CharacterFilterKey>(key: K, obj: Record<string, number>, translator: (key: string) => string) {
        const keys = Object.keys(obj) as EnumOrderValue<K>[];
        const sorted = sortByEnumOrder(key, keys);

        return sorted.map((name, index) => ({
            name: translator(name),
            value: obj[name],
            itemStyle: {
                color: getPieColor(key, index, name),
            },
        }));
    }

    const option = computed(() => {
        if (!characterAttributeDistributions.value || !selectedScope.value) return undefined;

        const scopeType = selectedScope.value.type;
        const isGlobal = scopeType === 'Global';
        const elementDistribution = characterAttributeDistributions.value.elementDistribution;
        const roleDistribution = characterAttributeDistributions.value.roleDistribution;
        const weaponDistribution = characterAttributeDistributions.value.weaponDistribution;
        const regionDistribution = characterAttributeDistributions.value.regionDistribution;
        const rarityDistribution = characterAttributeDistributions.value.rarityDistribution;
        const modelTypeDistribution = characterAttributeDistributions.value.modelTypeDistribution;

        return isGlobal
            ? {
                  tooltip: {
                      ...tooltipStyle('single'),
                  },
                  radar: undefined,
                  series: [
                      // --- Pie 1: 元素 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['60%', '15%'],
                          data: toPieSorted('element', elementDistribution, elementTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 2: 武器 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['85%', '15%'],
                          data: toPieSorted('weapon', weaponDistribution, weaponTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 3: 體型 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['60%', '50%'],
                          data: toPieSorted('modelType', modelTypeDistribution, modelTypeTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 4: 定位 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['85%', '50%'],
                          data: toPieSorted('role', roleDistribution, roleTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 5: 國家 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['60%', '85%'],
                          data: toPieSorted('region', regionDistribution, regionTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 5: 稀有度 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['85%', '85%'],
                          data: toPieSorted('rarity', rarityDistribution, rarityTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },
                  ],
              }
            : {
                  tooltip: {
                      ...tooltipStyle('single'),
                  },
                  radar: {
                      indicator: [
                          { name: '角色多樣性', max: 100 },
                          { name: 'Meta', max: 100 },
                          { name: '元素多樣性', max: 100 },
                          { name: '定位多樣性', max: 100 },
                          { name: '武器多樣性', max: 100 },
                          { name: '體型多樣性', max: 100 },
                          { name: '地區多樣性', max: 100 },
                          { name: '稀有度多樣性', max: 100 },
                      ],
                      center: ['25%', '40%'],
                      radius: '40%',
                      splitNumber: 4,
                      axisName: {
                          color: designTokens.colorOnSurface.value,
                      },
                      splitLine: {
                          lineStyle: {
                              color: designTokens.colorOnSurfaceVariant.value,
                          },
                      },
                      splitArea: { show: false },
                      axisLine: {
                          lineStyle: {
                              color: designTokens.colorOnSurfaceVariant.value,
                          },
                      },
                  },
                  series: [
                      {
                          type: 'radar',
                          data: [
                              {
                                  value: [
                                      playerStyle.value?.versatility.toFixed(2),
                                      playerStyle.value?.metaAffinity.toFixed(2),
                                      playerStyle.value?.elementAdjustedDiversity.toFixed(2),
                                      playerStyle.value?.roleAdjustedDiversity.toFixed(2),
                                      playerStyle.value?.weaponAdjustedDiversity.toFixed(2),
                                      playerStyle.value?.modelTypeAdjustedDiversity.toFixed(2),
                                      playerStyle.value?.regionAdjustedDiversity.toFixed(2),
                                      playerStyle.value?.rarityAdjustedDiversity.toFixed(2),
                                  ],
                                  name: '玩家風格',
                                  itemStyle: {
                                      color: designTokens.colorPrimary.value,
                                  },
                                  areaStyle: {
                                      color: designTokens.colorPrimary.value,
                                      opacity: 0.2,
                                  },
                                  emphasis: { disabled: true },
                              },
                          ],
                      },
                      // --- Pie 1: 元素 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['60%', '15%'],
                          data: toPieSorted('element', elementDistribution, elementTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 2: 武器 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['85%', '15%'],
                          data: toPieSorted('weapon', weaponDistribution, weaponTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 3: 體型 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['60%', '50%'],
                          data: toPieSorted('modelType', modelTypeDistribution, modelTypeTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 4: 定位 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['85%', '50%'],
                          data: toPieSorted('role', roleDistribution, roleTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 5: 國家 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['60%', '85%'],
                          data: toPieSorted('region', regionDistribution, regionTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },

                      // --- Pie 5: 稀有度 ---
                      {
                          type: 'pie',
                          radius: ['20%', '30%'],
                          center: ['85%', '85%'],
                          data: toPieSorted('rarity', rarityDistribution, rarityTranslator),
                          label: { color: designTokens.colorOnSurface.value },
                      },
                  ],
              };
    });

    return { scopes, selectedScopeKey, selectedScope, option, getScopeKey };
}
