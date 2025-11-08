<!-- src/features/Analysis/components/CharacterArchetypeMapChart.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent } from 'echarts/components';
import { useCharacterArchetypeMap } from './composables/useCharacterArchetypeMap';

use([CanvasRenderer, ScatterChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent]);

const props = defineProps<{}>();
const emit = defineEmits<{}>();

const { option } = useCharacterArchetypeMap()

</script>

<template>
    <VChart v-if="option" :option="option" style="width: 100%; height: 100%" />
</template>

<style scoped></style>
