// src/features/Analysis/components/composables/useCharacterBanPickUtilityStats.ts

import { computed, onMounted, ref } from 'vue';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/composables/useCharacterDomain';

export function useCharacterBanPickUtilityStats() {
    // const analysisDomain = useAnalysisDomain();
    // const { fetchBanPickUtilityStats } = analysisDomain;
    // const characterDomain = useCharacterDomain();
    // const { getDisplayName } = characterDomain;

    // const stats = ref<Record<string, { pick: number; ban: number; utility: number }> | null>(null);

    // onMounted(async () => {
    //     stats.value = await fetchBanPickUtilityStats();
    // });

    // const option = computed(() => {
    //     if (!stats.value) return null;

    //     const chars = Object.keys(stats.value)
    //     .sort((a, b) => {
    //         const sa = stats.value![a];
    //         const sb = stats.value![b];
    //         const sumA = sa.pick + sa.ban + sa.utility;
    //         const sumB = sb.pick + sb.ban + sb.utility;
    //         return sumB - sumA; // 大 → 小
    //     })
    //     .slice(0, 10);
    //     console.table(chars);
    //     return {
    //         tooltip: { trigger: 'axis' },
    //         legend: { data: ['Pick', 'Ban', 'Utility'] },
    //         xAxis: { 
    //             type: 'category',
    //             data: chars.map(getDisplayName),
    //             axisLabel: { rotate: 60 }, 
    //             boundaryGap: true 
    //         },
    //         yAxis: { type: 'value' },
    //         series: [
    //             {
    //                 name: 'Pick',
    //                 type: 'bar',
    //                 data: chars.map((c) => stats.value![c].pick),
    //                 itemStyle: { color: 'rgb(244, 211, 140)' },
    //                 barCategoryGap: '35%', 
    //                 barGap: '0%',
    //             },
    //             { 
    //                 name: 'Ban', 
    //                 type: 'bar', 
    //                 data: chars.map((c) => stats.value![c].ban), 
    //                 itemStyle: { color: 'rgb(255, 84, 73)' } 
    //             },
    //             { 
    //                 name: 'Utility', 
    //                 type: 'bar', 
    //                 data: chars.map((c) => stats.value![c].utility), 
    //                 itemStyle: { color: 'rgb(82, 109, 255)' } },
    //         ],
    //     };
    // });

    // return { option };
}
