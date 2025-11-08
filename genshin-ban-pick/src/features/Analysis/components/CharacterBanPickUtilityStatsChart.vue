<!-- src/features/Analysis/components/CharacterBanPickUtilityStatsChart.vue -->


<script setup lang="ts">
import { onMounted, ref } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, VisualMapComponent, LegendComponent } from 'echarts/components';
import { useCharacterBanPickUtilityStats } from './composables/useCharacterBanPickUtilityStats';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent]);

const props = defineProps<{}>();

const emit = defineEmits<{}>();

const { option } = useCharacterBanPickUtilityStats();
</script>

<template>
    <VChart v-if="option" :option="option" style="width: 100%; height: 100%" />
</template>

<style scoped></style>
