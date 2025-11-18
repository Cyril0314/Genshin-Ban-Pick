// src/composables/useDesignTokens.ts

import { useCssVar } from '@vueuse/core';

import { useScopedCssVar } from './useScopedCssVar';

export function useDesignTokens(selector: string = '.scale-context') {
    // 🅰️ 字體大小
    const { cssVar: fontSizeXs } = useScopedCssVar('--font-size-xs', selector);
    const { cssVar: fontSizeSm } = useScopedCssVar('--font-size-sm', selector);
    const { cssVar: fontSizeMd } = useScopedCssVar('--font-size-md', selector);
    const { cssVar: fontSizeLg } = useScopedCssVar('--font-size-lg', selector);
    const { cssVar: fontSizeXl } = useScopedCssVar('--font-size-xl', selector);
    const { cssVar: fontSizeXxl } = useScopedCssVar('--font-size-xxl', selector);

    // 🅱️ 間距 spacing
    const { cssVar: spaceXs } = useScopedCssVar('--space-xs', selector);
    const { cssVar: spaceSm } = useScopedCssVar('--space-sm', selector);
    const { cssVar: spaceMd } = useScopedCssVar('--space-md', selector);
    const { cssVar: spaceLg } = useScopedCssVar('--space-lg', selector);
    const { cssVar: spaceXl } = useScopedCssVar('--space-xl', selector);

    // ⚙️ 基準值
    const { cssVar: baseSize } = useScopedCssVar('--base-size', selector);

    // ===============================
    // ✍️ 文字行高 / 字重 / 字體家族
    // ===============================
    
    // 🎨 圓角
    const radiusXs = useCssVar('--radius-xs');
    const radiusSm = useCssVar('--radius-sm');
    const radiusMd = useCssVar('--radius-md');
    const radiusLg = useCssVar('--radius-lg');
    const radiusXl = useCssVar('--radius-xl');

    // 行高
    const lineHeightTightest = useCssVar('--line-height-tightest');
    const lineHeightTight = useCssVar('--line-height-tight');
    const lineHeightNormal = useCssVar('--line-height-normal');
    const lineHeightLoose = useCssVar('--line-height-loose');

    // 字重
    const fontWeightRegular = useCssVar('--font-weight-regular');
    const fontWeightMedium = useCssVar('--font-weight-medium');
    const fontWeightBold = useCssVar('--font-weight-bold');
    const fontWeightHeavy = useCssVar('--font-weight-heavy');

    // 字體家族
    const fontFamilySans = useCssVar('--font-family-sans');
    const fontFamilyMono = useCssVar('--font-family-mono');
    const fontFamilyTitle = useCssVar('--font-family-title');
    const fontFamilyBody = useCssVar('--font-family-body');
    const fontFamilyPixel = useCssVar('--font-family-pixel');
    const fontFamilyTechTitle = useCssVar('--font-family-tech-title');
    const fontFamilyTechUi = useCssVar('--font-family-tech-ui');
    const fontFamilyTechMono = useCssVar('--font-family-tech-mono');

    // Semantic Color
    const colorPrimary = useCssVar('--md-sys-color-primary');
    const colorOnPrimary = useCssVar('--md-sys-color-on-primary');
    const colorPrimaryContainer = useCssVar('--md-sys-color-primary-container');
    const colorOnPrimaryContainer = useCssVar('--md-sys-color-on-primary-container');

    const colorSecondary = useCssVar('--md-sys-color-secondary');
    const colorOnSecondary = useCssVar('--md-sys-color-on-secondary');
    const colorSecondaryContainer = useCssVar('--md-sys-color-secondary-container');
    const colorOnSecondaryContainer = useCssVar('--md-sys-color-on-secondary-container');

    const colorTertiary = useCssVar('--md-sys-color-tertiary');
    const colorOnTertiary = useCssVar('--md-sys-color-on-tertiary');
    const colorTertiaryContainer = useCssVar('--md-sys-color-tertiary-container');
    const colorOnTertiaryContainer = useCssVar('--md-sys-color-on-tertiary-container');

    const colorError = useCssVar('--md-sys-color-error');
    const colorOnError = useCssVar('--md-sys-color-on-error');
    const colorErrorContainer = useCssVar('--md-sys-color-error-container');
    const colorOnErrorContainer = useCssVar('--md-sys-color-on-error-container');

    const colorBackground = useCssVar('--md-sys-color-background');
    const colorOnBackground = useCssVar('--md-sys-color-on-background');

    const colorSurface = useCssVar('--md-sys-color-surface');
    const colorOnSurface = useCssVar('--md-sys-color-on-surface');
    const colorSurfaceVariant = useCssVar('--md-sys-color-surface-variant');
    const colorOnSurfaceVariant = useCssVar('--md-sys-color-on-surface-variant');

    const colorOutline = useCssVar('--md-sys-color-outline');
    const colorOutlineVariant = useCssVar('--md-sys-color-outline-variant');

    // ===============================
    // 🪟 透明容器層級
    // ===============================
    const colorSurfaceContainerLowest = useCssVar('--md-sys-color-surface-container-lowest');
    const colorSurfaceContainerLow = useCssVar('--md-sys-color-surface-container-low');
    const colorSurfaceContainer = useCssVar('--md-sys-color-surface-container');
    const colorSurfaceContainerHigh = useCssVar('--md-sys-color-surface-container-high');
    const colorSurfaceContainerHighest = useCssVar('--md-sys-color-surface-container-highest');

    return {
        // 🔠 字體
        fontSizeXs,
        fontSizeSm,
        fontSizeMd,
        fontSizeLg,
        fontSizeXl,
        fontSizeXxl,
        // 📏 間距
        spaceXs,
        spaceSm,
        spaceMd,
        spaceLg,
        spaceXl,
        // 🧱 圓角
        radiusXs,
        radiusSm,
        radiusMd,
        radiusLg,
        radiusXl,
        // ⚙️ 基礎比例
        baseSize,

        // 文字行高與字重
        lineHeightTightest,
        lineHeightTight,
        lineHeightNormal,
        lineHeightLoose,
        fontWeightRegular,
        fontWeightMedium,
        fontWeightBold,
        fontWeightHeavy,

        // 字體家族
        fontFamilySans,
        fontFamilyMono,
        fontFamilyTitle,
        fontFamilyBody,
        fontFamilyPixel,
        fontFamilyTechTitle,
        fontFamilyTechUi,
        fontFamilyTechMono,

        // semantic colors
        colorPrimary,
        colorOnPrimary,
        colorPrimaryContainer,
        colorOnPrimaryContainer,
        colorSecondary,
        colorOnSecondary,
        colorSecondaryContainer,
        colorOnSecondaryContainer,
        colorTertiary,
        colorOnTertiary,
        colorTertiaryContainer,
        colorOnTertiaryContainer,
        colorError,
        colorOnError,
        colorErrorContainer,
        colorOnErrorContainer,
        colorBackground,
        colorOnBackground,
        colorSurface,
        colorOnSurface,
        colorSurfaceVariant,
        colorOnSurfaceVariant,
        colorOutline,
        colorOutlineVariant,
        colorSurfaceContainerLowest,
        colorSurfaceContainerLow,
        colorSurfaceContainer,
        colorSurfaceContainerHigh,
        colorSurfaceContainerHighest,
    };
}
