// src/app/theme/naiveThemeOverrides.ts
//
// 把 Naive UI 內建 theme tokens 對齊到 MD3 design tokens（CSS vars）。
// 透過 <n-config-provider :theme-overrides="..."> 在 App.vue 注入。
//
// 用 var() 引用 MD3 token，MD3 改色 Naive 自動跟上。
// 涵蓋目前 codebase 用到的 Naive 元件：n-modal / n-card / n-drawer / n-button / n-icon。
// 新增元件時依需要擴充對應 section。

import type { GlobalThemeOverrides } from 'naive-ui';

export const naiveThemeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: 'var(--md-sys-color-primary)',
        primaryColorHover: 'var(--primary-filled-hover)',
        primaryColorPressed: 'var(--primary-filled-pressed)',
        primaryColorSuppl: 'var(--md-sys-color-primary)',

        errorColor: 'var(--md-sys-color-error)',
        errorColorHover: 'var(--md-sys-color-error)',
        errorColorPressed: 'var(--md-sys-color-error)',

        textColorBase: 'var(--md-sys-color-on-surface)',
        textColor1: 'var(--md-sys-color-on-surface)',
        textColor2: 'var(--md-sys-color-on-surface-variant)',
        textColor3: 'var(--md-sys-color-on-surface-variant)',

        bodyColor: 'var(--md-sys-color-background)',
        cardColor: 'var(--md-sys-color-surface-container-high)',
        modalColor: 'var(--md-sys-color-surface-container-high)',
        popoverColor: 'var(--md-sys-color-surface-container-high)',

        borderColor: 'var(--md-sys-color-outline-variant)',
        dividerColor: 'var(--md-sys-color-outline-variant)',
    },

    // n-button：default mode 跟 text mode 是兩組獨立 token；text mode 用 textColorText* 系列。
    Button: {
        // default mode（<n-button>）
        textColor: 'var(--md-sys-color-on-surface-variant)',
        textColorHover: 'var(--md-sys-color-on-surface)',
        textColorPressed: 'var(--md-sys-color-on-surface-variant)',
        textColorFocus: 'var(--md-sys-color-on-surface)',

        // text mode（<n-button text>）
        textColorText: 'var(--md-sys-color-on-surface-variant)',
        textColorTextHover: 'var(--md-sys-color-on-surface)',
        textColorTextPressed: 'var(--md-sys-color-on-surface-variant)',
        textColorTextFocus: 'var(--md-sys-color-on-surface)',
        textColorTextDisabled: 'var(--md-sys-color-on-surface-variant)',
    },

    Card: {
        color: 'var(--md-sys-color-surface-container-high)',
        textColor: 'var(--md-sys-color-on-surface)',

        titleTextColor: 'var(--md-sys-color-on-surface)',
        titleFontWeight: '700',
        titleFontSizeSmall: 'var(--font-size-md)',
        titleFontSizeMedium: 'var(--font-size-lg)',
        titleFontSizeLarge: 'var(--font-size-xl)',
        titleFontSizeHuge: 'var(--font-size-xxl)',

        closeIconColor: 'var(--md-sys-color-on-surface-variant)',
        closeIconColorHover: 'var(--md-sys-color-on-surface)',
        closeColorHover: 'var(--md-sys-color-surface-container-highest)',
        borderColor: 'var(--md-sys-color-outline-variant)',
    },

    Modal: {
        color: 'var(--md-sys-color-surface-container-high)',
        textColor: 'var(--md-sys-color-on-surface)',
    },

    Drawer: {
        color: 'var(--md-sys-color-surface-container)',
        textColor: 'var(--md-sys-color-on-surface)',
        titleTextColor: 'var(--md-sys-color-on-surface)',
    },
};
