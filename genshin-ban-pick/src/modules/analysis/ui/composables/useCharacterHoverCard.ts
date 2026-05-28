// src/modules/analysis/ui/composables/useCharacterHoverCard.ts

import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { storeToRefs } from 'pinia';

import { useCharacterStore } from '@/modules/character';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useAnalysisMetaStore } from '../../store/analysisMetaStore';

import { Element } from '@shared/contracts/character/value-types';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';

const TOP_SYNERGY_COUNT = 5;

export function useCharacterHoverCard(characterKey: MaybeRefOrGetter<string>) {
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const analysisUseCase = useAnalysisUseCase();

    const { characterMap } = storeToRefs(useCharacterStore());
    const { usageMap, pickPriorityMap, synergyMatrix, isInitialized } = storeToRefs(useAnalysisMetaStore());

    function load() {
        analysisUseCase.loadCharacterMeta();
    }

    const key = computed(() => toValue(characterKey));

    const character = computed(() => characterMap.value[key.value]);
    const displayName = computed(() => getCharacterDisplayName(key.value));
    const elementColor = computed(() => elementColors[character.value?.element ?? Element.None].main);

    const usage = computed(() => usageMap.value[key.value]);
    const pickPriority = computed(() => pickPriorityMap.value[key.value]);

    const totalAppearances = computed(() => {
        if (!usage.value) return undefined;
        const { pick, ban, utility } = usage.value.context;
        return pick.total + ban.total + utility.total;
    });

    const pickPriorityText = computed(() => (pickPriority.value ? `${((1 - pickPriority.value.pickPriority) * 100).toFixed(0)}%` : '—'));

    const topSynergies = computed(() => (isInitialized.value ? topCoOccurring(synergyMatrix.value, key.value) : []));

    function topCoOccurring(matrix: CharacterSynergyMatrix, key: string) {
        const row = matrix[key];
        if (!row) return [] as { key: string; name: string; count: number }[];
        return Object.entries(row)
            .filter(([otherKey, count]) => otherKey !== key && (count ?? 0) > 0)
            .map(([otherKey, count]) => ({ key: otherKey, name: getCharacterDisplayName(otherKey), count: count as number }))
            .sort((a, b) => b.count - a.count)
            .slice(0, TOP_SYNERGY_COUNT);
    }

    return {
        load,
        character,
        displayName,
        elementColor,
        usage,
        totalAppearances,
        pickPriorityText,
        topSynergies,
        isInitialized,
    };
}
