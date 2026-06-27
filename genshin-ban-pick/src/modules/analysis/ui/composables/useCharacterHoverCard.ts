// src/modules/analysis/ui/composables/useCharacterHoverCard.ts

import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { storeToRefs } from 'pinia';

import { useCharacterStore } from '@/modules/character';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useAnalysisMetaStore } from '../../store/analysisMetaStore';

import { Element } from '@shared/contracts/character/value-types';
import { pickTopCooccurrenceEntries } from '@shared/contracts/analysis/ICooccurrenceEntry';

const TOP_COOCCURRENCE_COUNT = 5;

export function useCharacterHoverCard(characterKey: MaybeRefOrGetter<string>) {
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const analysisUseCase = useAnalysisUseCase();

    const { characterMap } = storeToRefs(useCharacterStore());
    const { usageMap, pickPriorityMap, characterCooccurrenceMatrix } = storeToRefs(useAnalysisMetaStore());

    function load() {
        analysisUseCase.loadCharacterMeta();
    }

    const key = computed(() => toValue(characterKey));

    const character = computed(() => characterMap.value[key.value]);
    const displayName = computed(() => getCharacterDisplayName(key.value));
    const elementColor = computed(() => elementColors[character.value?.element ?? Element.None].main);

    const usage = computed(() => usageMap.value?.[key.value]);
    const pickPriority = computed(() => pickPriorityMap.value?.[key.value]);

    const totalAppearances = computed(() => {
        if (!usage.value) return undefined;
        const { pick, ban, utility } = usage.value.context;
        return pick.total + ban.total + utility.total;
    });

    const pickPriorityText = computed(() => (pickPriority.value ? `${((1 - pickPriority.value.pickPriority) * 100).toFixed(0)}%` : '—'));

    const isReady = computed(() => !!usageMap.value); // 字典載入即視為 ready（hover card 經 loadCharacterMeta 一起載字典+矩陣）

    const topCooccurrenceEntries = computed(() => {
        const matrix = characterCooccurrenceMatrix.value;
        if (!matrix) return [];
        return pickTopCooccurrenceEntries(key.value, matrix, TOP_COOCCURRENCE_COUNT).map((entry) => ({
            ...entry,
            name: getCharacterDisplayName(entry.key),
        }));
    });

    return {
        load,
        character,
        displayName,
        elementColor,
        usage,
        totalAppearances,
        pickPriorityText,
        topCooccurrenceEntries,
        isReady,
    };
}
