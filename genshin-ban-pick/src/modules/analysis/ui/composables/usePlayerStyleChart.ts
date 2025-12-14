import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useAuthStore } from '@/modules/auth';
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

import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';
import type { EnumOrderValue } from '@/modules/shared/ui/composables/useCharacterSorter';

type PlayerSelectOption = { type: 'Player'; identity: MatchTeamMemberUniqueIdentity } | { type: 'Global' };

export function usePlayerStyleChart() {
    const { tooltipStyle } = useEchartTheme();
    const designTokens = useDesignTokens();
    const authStore = useAuthStore();
    const { identity } = storeToRefs(authStore);

    const analysisUseCase = useAnalysisUseCase();
    const matchUseCase = useMatchUseCase();

    const players = ref<MatchTeamMemberUniqueIdentity[]>([]);

    const playerSelectOptions = computed<PlayerSelectOption[]>(() => {
        const global: PlayerSelectOption = { type: 'Global' };

        const playersOptions: PlayerSelectOption[] = players.value.map((p) => ({
            type: 'Player',
            identity: p,
        }));

        return [global, ...playersOptions];
    });

    const globalOption = computed<PlayerSelectOption>(() => ({
        type: 'Global',
    }));

    const playerOptions = computed<PlayerSelectOption[]>(() =>
        players.value.map((p) => ({
            type: 'Player',
            identity: p,
        })),
    );

    const selectedOptionKey = ref<string | null>(null);

    const selectedOption = computed<PlayerSelectOption | null>({
        get() {
            if (!selectedOptionKey.value) return null;
            return playerSelectOptions.value.find((option) => getOptionKey(option) === selectedOptionKey.value) ?? null;
        },
        set(option) {
            selectedOptionKey.value = option ? getOptionKey(option) : null;
        },
    });
    const playerStyle = ref<IPlayerStyleProfile | null>(null);

    onMounted(async () => {
        players.value = await matchUseCase.fetchMatchTeamMembers();

        const self = players.value.find((player) => player.type === identity.value?.type && player.id === identity.value?.user.id);
        if (self) {
            selectedOption.value = { type: 'Player', identity: self };
        } else {
            selectedOption.value = { type: 'Player', identity: players.value[0] };
        }

        if (selectedOption.value.type === 'Player') {
            playerStyle.value = await analysisUseCase.fetchPlayerStyleProfile({ identity: selectedOption.value.identity });
        }
    });

    watch(selectedOption, async () => {
        if (!selectedOption.value) return;
        if (selectedOption.value.type === 'Player') {
            playerStyle.value = await analysisUseCase.fetchPlayerStyleProfile({ identity: selectedOption.value.identity });
        }
    });

    function getOptionKey(option: PlayerSelectOption): string {
        switch (option.type) {
            case 'Global':
                return 'global';
            case 'Player':
                switch (option.identity.type) {
                    case 'Member':
                        return `member:${option.identity.id}`;
                    case 'Guest':
                        return `guest:${option.identity.id}`;
                    case 'Name':
                        return `name:${option.identity.name}`;
                }
        }
    }

    function getPieColor<K extends CharacterFilterKey>(key: K, index: number, name: EnumOrderValue<K>) {
        if (key === 'element') {
            const elementName = name as keyof typeof elementColors;
            return elementColors[elementName]?.main ?? '#999999';
        }
        return null;
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
        if (!playerStyle.value || !selectedOption.value) return null;

        const stats = playerStyle.value;

        const optionType = selectedOption.value.type;
        const isGlobal = optionType === 'Global';
        const elementCounts = isGlobal ? stats.globalElementCounts : stats.playerElementCounts;
        const roleCounts = isGlobal ? stats.globalRoleCounts : stats.playerRoleCounts;
        const weaponCounts = isGlobal ? stats.globalWeaponCounts : stats.playerWeaponCounts;
        const regionCounts = isGlobal ? stats.globalRegionCounts : stats.playerRegionCounts;
        const rarityCounts = isGlobal ? stats.globalRarityCounts : stats.playerRarityCounts;
        const modelTypeCounts = isGlobal ? stats.globalModelTypeCounts : stats.playerModelTypeCounts;

        return {
            tooltip: {
                ...tooltipStyle('single'),
                // formatter: (params: CallbackDataParams) => {
                //     const values = Array.isArray(params.value) ? params.value : [];

                //     const labels = [
                //         '冷門角 (Versatility)',
                //         'Meta (Meta Affinity)',
                //         '定位多樣性 (Role Diversity)',
                //         '元素多樣性 (Element Diversity)',
                //         '武器多樣性 (Weapon Diversity)',
                //         '體型多樣性 (Model Type Diversity)',
                //     ];

                //     return values
                //         .map((v, i) => {
                //             if (typeof v === 'number') {
                //                 return `${labels[i]}：${v.toFixed(2)}%`;
                //             } else {
                //                 return null
                //             }
                //         })
                //         .join('<br/>');
                // },
            },
            ...(isGlobal
                ? {}
                : {
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
                  }),
            series: [
                ...(!isGlobal
                    ? [
                          {
                              type: 'radar',
                              data: [
                                  {
                                      value: [
                                          stats.versatility.toFixed(2),
                                          stats.metaAffinity.toFixed(2),
                                          stats.elementAdjustedDiversity.toFixed(2),
                                          stats.roleAdjustedDiversity.toFixed(2),
                                          stats.weaponAdjustedDiversity.toFixed(2),
                                          stats.modelTypeAdjustedDiversity.toFixed(2),
                                          stats.regionAdjustedDiversity.toFixed(2),
                                          stats.rarityAdjustedDiversity.toFixed(2),
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
                      ]
                    : []),
                // --- Pie 1: 元素 ---
                {
                    type: 'pie',
                    radius: ['20%', '30%'],
                    center: ['60%', '15%'],
                    data: toPieSorted('element', elementCounts, elementTranslator),
                    label: { color: designTokens.colorOnSurface.value },
                },

                // --- Pie 2: 武器 ---
                {
                    type: 'pie',
                    radius: ['20%', '30%'],
                    center: ['85%', '15%'],
                    data: toPieSorted('weapon', weaponCounts, weaponTranslator),
                    label: { color: designTokens.colorOnSurface.value },
                },

                // --- Pie 3: 體型 ---
                {
                    type: 'pie',
                    radius: ['20%', '30%'],
                    center: ['60%', '50%'],
                    data: toPieSorted('modelType', modelTypeCounts, modelTypeTranslator),
                    label: { color: designTokens.colorOnSurface.value },
                },

                // --- Pie 4: 定位 ---
                {
                    type: 'pie',
                    radius: ['20%', '30%'],
                    center: ['85%', '50%'],
                    data: toPieSorted('role', roleCounts, roleTranslator),
                    label: { color: designTokens.colorOnSurface.value },
                },

                // --- Pie 5: 國家 ---
                {
                    type: 'pie',
                    radius: ['20%', '30%'],
                    center: ['60%', '85%'],
                    data: toPieSorted('region', regionCounts, regionTranslator),
                    label: { color: designTokens.colorOnSurface.value },
                },

                // --- Pie 5: 稀有度 ---
                {
                    type: 'pie',
                    radius: ['20%', '30%'],
                    center: ['85%', '85%'],
                    data: toPieSorted('rarity', rarityCounts, rarityTranslator),
                    label: { color: designTokens.colorOnSurface.value },
                },
            ],
        };
    });

    return { playerSelectOptions, playerOptions, globalOption, selectedOptionKey, selectedOption, option, getOptionKey };
}
