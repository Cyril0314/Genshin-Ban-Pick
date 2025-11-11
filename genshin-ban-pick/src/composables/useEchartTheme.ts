// src/composables/useEchartTheme.ts

import type {
    EChartsOption,
    GridComponentOption,
    XAXisComponentOption,
    YAXisComponentOption,
    LegendComponentOption,
    TooltipComponentOption,
    BarSeriesOption,
    DataZoomComponentOption,
} from 'echarts';
import { useDesignTokens } from './useDesignTokens';

type LegendPosition = 'top' | 'bottom' | 'left' | 'right';

function toNum(s: string | number): number {
    if (typeof s === 'number') return s;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
}

export function useEchartTheme(selector = '.scale-context') {
    const tokens = useDesignTokens(selector);

    function gridStyle(preset: 'tight' | 'normal' | 'loose' = 'normal', usePercentGrid: boolean = true): GridComponentOption {
        const d = 1;
        const base = {
            tight: {
                left: usePercentGrid ? '2.5%' : parseFloat(tokens.spaceXs.value) * d,
                right: usePercentGrid ? '6%' : parseFloat(tokens.spaceLg.value) * d,
                top: usePercentGrid ? '6%' : parseFloat(tokens.spaceLg.value) * d,
                bottom: usePercentGrid ? '4%' : parseFloat(tokens.spaceMd.value) * d,
            },
            normal: {
                left: usePercentGrid ? '2.5%' : parseFloat(tokens.spaceSm.value) * d,
                right: usePercentGrid ? '10%' : parseFloat(tokens.spaceXl.value) * d,
                top: usePercentGrid ? '10%' : parseFloat(tokens.spaceXl.value) * d,
                bottom: usePercentGrid ? '6%' : parseFloat(tokens.spaceLg.value) * d,
            },
            loose: {
                left: usePercentGrid ? '8.5%' : parseFloat(tokens.spaceXl.value) * d,
                right: usePercentGrid ? '6%' : parseFloat(tokens.spaceLg.value) * d,
                top: usePercentGrid ? '6%' : parseFloat(tokens.spaceLg.value) * d,
                bottom: usePercentGrid ? '8.5%' : parseFloat(tokens.spaceXl.value) * d,
            },
        }[preset];

        return {
            ...base,
        };
    }

    // X 軸（value）
    function xAxisStyle(): XAXisComponentOption {
        return {
            nameGap: parseFloat(tokens.spaceMd.value),
            nameLocation: 'end',
            nameTextStyle: {
                color: tokens.colorOnSurfaceVariant.value,
                fontSize: tokens.fontSizeMd.value,
                fontFamily: tokens.fontFamilySans.value,
            },
            axisLabel: {
                color: tokens.colorOnSurface.value,
                width: 1,
            },
            splitLine: {
                lineStyle: {
                    color: tokens.colorSurfaceVariant.value,
                    width: 1,
                },
            },
            axisTick: { show: true },
        };
    }

    // Y 軸（category）
    function yAxisStyle(): YAXisComponentOption {
        return {
            axisLabel: {
                color: tokens.colorOnSurface.value,
                fontSize: tokens.fontSizeMd.value,
                fontWeight: parseFloat(tokens.fontWeightMedium.value!),
                overflow: 'truncate',
            },
            axisLine: {
                lineStyle: {
                    color: tokens.colorSurfaceContainer.value,
                    width: 1,
                },
            },
            axisTick: { show: false },
        };
    }

    // Legend
    function legendStyle(legendPosition: LegendPosition = 'top'): LegendComponentOption {
        const common = {
            show: true,
            itemWidth: parseFloat(tokens.baseSize.value) * 10,
            itemHeight: parseFloat(tokens.baseSize.value) * 4,
            textStyle: {
                color: tokens.colorOnSurface.value,
                fontSize: parseFloat(tokens.fontSizeSm.value),
            },
        };

        switch (legendPosition) {
            case 'bottom':
                return { ...common, bottom: '2%', left: 'center', orient: 'horizontal' };
            case 'left':
                return { ...common, left: '2%', top: 'middle', orient: 'vertical' };
            case 'right':
                return { ...common, right: '2%', top: 'middle', orient: 'vertical' };
            default:
                return { ...common, top: '2%', left: 'center', orient: 'horizontal' };
        }
    }

    // Tooltip（單序列 or 雙序列）
    function tooltipStyle(mode: 'single' | 'axis' = 'single'): TooltipComponentOption {
        return mode === 'axis'
            ? {
                  trigger: 'axis',
                  axisPointer: { type: 'shadow' },
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  borderWidth: 0,
                  textStyle: { color: '#fff', fontSize: tokens.fontSizeSm.value },
                  extraCssText: 'backdrop-filter: blur(6px); padding: 8px 10px; border-radius: 8px;',
              }
            : {
                  trigger: 'item',
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  borderWidth: 0,
                  textStyle: { color: '#fff', fontSize: tokens.fontSizeSm.value },
                  extraCssText: 'backdrop-filter: blur(6px); padding: 8px 10px; border-radius: 8px;',
              };
    }

    function dataZoomStyle(): DataZoomComponentOption {
        return {
            zoomOnMouseWheel: true, // ✅ 滾輪縮放
            moveOnMouseMove: true, // ✅ 拖曳移動
            moveOnMouseWheel: true, // ✅ 滾輪捲動
            preventDefaultMouseMove: false, // 避免阻止全頁滾動
        };
    }

    return {
        gridStyle,
        xAxisStyle,
        yAxisStyle,
        legendStyle,
        tooltipStyle,
        dataZoomStyle,
    };
}

// | 元件類別         | 型別名稱                       | 用途              |
// | ------------ | -------------------------- | --------------- |
// | 🏷️ 標題       | `TitleComponentOption`     | 設定圖表標題（`title`） |
// | 🧭 圖例        | `LegendComponentOption`    | 控制 legend 位置與文字 |
// | 🧩 提示框       | `TooltipComponentOption`   | 設定 tooltip 顯示內容 |
// | 🧱 網格        | `GridComponentOption`      | 設定直角坐標系的位置與邊界   |
// | 🧭 軸（X）      | `XAXisComponentOption`     | X 軸設定           |
// | 🧭 軸（Y）      | `YAXisComponentOption`     | Y 軸設定           |
// | 📊 資料縮放      | `DataZoomComponentOption`  | 滾輪/滑桿縮放控制       |
// | 🎨 視覺映射      | `VisualMapComponentOption` | 把值映射成顏色或大小      |
// | 🧰 工具箱       | `ToolboxComponentOption`   | 匯出、縮放、重置按鈕      |
// | 📆 時間軸       | `TimelineComponentOption`  | 動畫播放時間控制        |
// | 📅 日曆        | `CalendarComponentOption`  | 日曆型圖表           |
// | 🧮 資料集       | `DatasetComponentOption`   | 結構化資料來源         |
// | 🧪 Transform | `TransformComponentOption` | 資料過濾、算術運算       |

// | 圖表類型  | 型別名稱                       | 說明         |
// | ----- | -------------------------- | ---------- |
// | 長條圖   | `BarSeriesOption`          | 用於直條/橫條圖   |
// | 折線圖   | `LineSeriesOption`         | 折線、面積圖     |
// | 圓餅圖   | `PieSeriesOption`          | 圓餅圖、玫瑰圖    |
// | 散點圖   | `ScatterSeriesOption`      | 散點、氣泡圖     |
// | 雷達圖   | `RadarSeriesOption`        | Radar 網格圖  |
// | K 線圖  | `CandlestickSeriesOption`  | 股價圖        |
// | 盒鬚圖   | `BoxplotSeriesOption`      | 統計分布       |
// | 熱圖    | `HeatmapSeriesOption`      | 密度分布顏色圖    |
// | 桑基圖   | `SankeySeriesOption`       | 流向圖        |
// | 漏斗圖   | `FunnelSeriesOption`       | 漏斗比例圖      |
// | 儀表板   | `GaugeSeriesOption`        | 半圓/指針式圖表   |
// | 象形長條圖 | `PictorialBarSeriesOption` | 使用自訂圖形顯示資料 |
// | 主題河流圖 | `ThemeRiverSeriesOption`   | 流動面積圖      |
// | 向日葵圖  | `SunburstSeriesOption`     | 層級圓形結構     |
// | 圖譜    | `GraphSeriesOption`        | 節點-連線型圖    |
// | 平行座標  | `ParallelSeriesOption`     | 高維度資料投影圖   |
