<!-- src/features/Analysis/Analysis.vue -->

<script setup lang="ts">
import { onMounted, ref } from "vue";

import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart } from "echarts/charts";
import { BarChart } from "echarts/charts";
import {
    GridComponent,
    TooltipComponent,
    VisualMapComponent,
} from "echarts/components";

import { useAnalysisDomain } from "@/composables/useAnalysisDomain";
import { characterNameMap } from "@/constants/characterNameMap";

// 註冊需要的模組（不需要的不用載 → bundle 更小）
use([
    CanvasRenderer,
    HeatmapChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    VisualMapComponent,
]);

const components = { VChart };

const analysisDomain = useAnalysisDomain()

const props = defineProps<{

}>();

const emit = defineEmits<{

}>();

const testChart = {
    xAxis: { type: "category", data: ["A", "B", "C"] },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: [12, 20, 8] }],
};

const option = ref<any>(null);

onMounted(async () => {
    const synergy = await analysisDomain.fetchSynergy();
    const chars = Object.keys(synergy).sort();

    console.table(synergy)

    // 轉成 Heatmap 格式
    const matrix = [];
    for (let i = 0; i < chars.length; i++) {
        for (let j = 0; j < chars.length; j++) {
            matrix.push([i, j, synergy[chars[i]]?.[chars[j]] ?? 0]);
        }
    }

    option.value = {
        tooltip: {
            position: 'top',
            formatter: (params: { value: [number, number, number] }) => {
                const [x, y, count] = params.value;
                if (count === 0) return '無明顯搭配';
                return `${characterNameMap[chars[x]]} + ${characterNameMap[chars[y]]}<br/>同場使用：${count} 次`;
            }
        },
        grid: { height: "100%", top: "5%" },
        xAxis: { type: "category", data: chars.map((char) => characterNameMap[char]), axisLabel: { rotate: 60 } },
        yAxis: { type: "category", data: chars.map((char) => characterNameMap[char]) },
        visualMap: {
            min: 0,
            max: Math.max(...matrix.map((d) => d[2])),
            calculable: true,
            orient: "vertical",
            right: 0,
            top: "center",
            inRange: { color: ["#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"] }
        },
        series: [
            {
                type: "heatmap",
                data: matrix,
                emphasis: { itemStyle: { borderColor: "#333", borderWidth: 1 } }
            }
        ]
    };
});

</script>

<template>
    <!-- <VChart :option="testChart" style="width:100%; height:500px;" /> -->
    <VChart :option="option" style="width:100%; height:850px;" />
</template>

<style scoped></style>
