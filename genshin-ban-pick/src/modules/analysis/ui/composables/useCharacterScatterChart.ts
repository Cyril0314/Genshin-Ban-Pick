import { computed, onMounted, ref } from 'vue';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useCharacterStore } from '@/modules/character';
import { storeToRefs } from 'pinia';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';

interface IScatterPoint {
    characterKey: string;
    usage: number;
    priority: number;

    rawUsage: number;
    rawRank: number;
    pickCount: number;
}

export function useCharacterScatterChart() {
    const analysisUseCase = useAnalysisUseCase();
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const designTokens = useDesignTokens();
    const { gridStyle, valueAxisStyle, tooltipStyle } = useEchartTheme();

    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    const characterUsages = ref<ICharacterUsage[]>([]);
    const pickPriorities = ref<ICharacterPickPriority[]>([]);

    onMounted(async () => {
        const [usages, priorities] = await Promise.all([
            analysisUseCase.fetchCharacterUsageSummary(),
            analysisUseCase.fetchCharacterUsagePickPriority(),
        ]);
        characterUsages.value = usages;
        pickPriorities.value = priorities;
    });

    const option = computed(() => {
        if (!characterUsages.value.length || !pickPriorities.value.length || !characterMap.value) return undefined;

        // Merge Data
        const points: IScatterPoint[] = [];
        const priorityMap = new Map<string, ICharacterPickPriority>();
        pickPriorities.value.forEach((p) => priorityMap.set(p.characterKey, p));

        characterUsages.value.forEach((u) => {
            const p = priorityMap.get(u.characterKey);
            if (p) {
                points.push({
                    characterKey: u.characterKey,
                    usage: u.effectiveUsage,

                    priority: 1 - p.pickPriority,

                    rawUsage: u.effectiveUsage,
                    rawRank: p.pickPriority,
                    pickCount: p.pickCount,
                });
            }
        });

        const maxUsage = Math.max(...points.map((p) => p.usage));
        const xT1 = maxUsage / 3;
        const xT2 = (maxUsage * 2) / 3;

        const yT1 = 0.333;
        const yT2 = 0.666;

        return {
            tooltip: {
                ...tooltipStyle('single'),
                formatter: (p: CallbackDataParams) => {
                    const d = p.data as any; // [x, y, dataObj]
                    const point = d[2] as IScatterPoint;

                    const u = point.usage;
                    const pr = point.priority;

                    let label = '';
                    // Usage Level: 0=Low, 1=Mid, 2=High
                    const uLevel = u < xT1 ? 0 : u < xT2 ? 1 : 2;
                    const pLevel = pr < yT1 ? 0 : pr < yT2 ? 1 : 2;

                    // Matrix [Priority][Usage]
                    const labels = [
                        // Usage Low          // Usage Mid          // Usage High
                        ['冷門位', '針對位', '泛用位'], // Priority Low
                        ['潛力位', '平衡位', '核心位'], // Priority Mid
                        ['奇兵位', '強勢位', '人權'], // Priority High
                    ];

                    label = labels[pLevel][uLevel];

                    return `
                        <b>${getCharacterDisplayName(point.characterKey)}</b><br/>
                        <span style="color: ${designTokens.colorPrimary.value}">● ${label}</span><br/><br/>
                        使用權重 (Usage): ${point.usage.toFixed(2)}<br/>
                        搶角優先 (Priority): ${(point.priority * 100).toFixed(1)}%<br/>
                        採樣場次: ${point.pickCount}
                    `;
                },
            },
            grid: {
                ...gridStyle('tight', true),
            },
            xAxis: {
                ...valueAxisStyle(),
                name: '泛用度',
                splitLine: { show: false },
                max: maxUsage,
            },
            yAxis: {
                ...valueAxisStyle(),
                name: '優先級',
                splitLine: { show: false },
                min: 0,
                max: 1,
            },
            series: [
                {
                    type: 'scatter',
                    symbolSize: (val: any) => {
                        const count = val[2].pickCount;
                        return Math.max(12, Math.min(48, Math.sqrt(count) * 8));
                    },
                    data: points.map((p) => [p.usage, p.priority, p]),
                    itemStyle: {
                        color: (params: CallbackDataParams) => {
                            const p = params.data as any;
                            const point = p[2] as IScatterPoint;
                            const element = characterMap.value[point.characterKey]?.element;
                            return elementColors[element]?.main ?? '#888';
                        },
                        // shadowBlur: 10,
                        // shadowColor: 'rgba(0,0,0,0.3)',
                    },
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        lineStyle: {
                            type: 'dashed',
                            color: designTokens.colorOutline.value,
                            width: 1,
                            opacity: 0.5,
                        },
                        label: { show: false },
                        data: [{ xAxis: xT1 }, { xAxis: xT2 }, { yAxis: yT1 }, { yAxis: yT2 }],
                    },
                    markArea: {
                        silent: true,
                        itemStyle: {
                            color: 'transparent',
                            borderWidth: 0,
                        },
                        label: {
                            show: true,
                            color: designTokens.colorOnSurfaceVariant.value,
                            fontSize: designTokens.fontSizeMd.value,
                            opacity: 0.5,
                            position: 'inside',
                        },
                        data: [
                            // Row 3 (High Priority)
                            [
                                { name: '奇兵', xAxis: 0, yAxis: yT2 },
                                { xAxis: xT1, yAxis: 1 },
                            ],
                            [
                                { name: '強勢', xAxis: xT1, yAxis: yT2 },
                                { xAxis: xT2, yAxis: 1 },
                            ],
                            [
                                { name: '人權', xAxis: xT2, yAxis: yT2 },
                                { xAxis: 'max', yAxis: 1 },
                            ],

                            // Row 2 (Mid Priority)
                            [
                                { name: '潛力', xAxis: 0, yAxis: yT1 },
                                { xAxis: xT1, yAxis: yT2 },
                            ],
                            [
                                { name: '平衡', xAxis: xT1, yAxis: yT1 },
                                { xAxis: xT2, yAxis: yT2 },
                            ],
                            [
                                { name: '核心', xAxis: xT2, yAxis: yT1 },
                                { xAxis: 'max', yAxis: yT2 },
                            ],

                            // Row 1 (Low Priority)
                            [
                                { name: '冷門', xAxis: 0, yAxis: 0 },
                                { xAxis: xT1, yAxis: yT1 },
                            ],
                            [
                                { name: '針對', xAxis: xT1, yAxis: 0 },
                                { xAxis: xT2, yAxis: yT1 },
                            ],
                            [
                                { name: '泛用', xAxis: xT2, yAxis: 0 },
                                { xAxis: 'max', yAxis: yT1 },
                            ],
                        ],
                    },
                },
            ],
        };
    });

    return { option };
}
