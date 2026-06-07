// src/modules/shared/ui/composables/getTeamTheme.ts

const themeKeyMap: Record<number, string> = { 0: 'first', 1: 'second' }

// 預先為每個 theme key 建好 CSS var 物件，全 app 共用同一實例。
// 跟 themeKeyMap 同性質的靜態查表 —— 純 mapping、無 reactive 依賴，所以不用 computed。
function buildThemeVars(key: string): Record<string, string> {
    return {
        '--team-color': `var(--team-${key}-color)`,
        '--team-color-rgb': `var(--team-${key}-color-rgb)`,
        '--team-on-color': `var(--team-${key}-on-color)`,
        '--team-color-bg': `var(--team-${key}-color-bg)`,
        '--team-on-color-bg': `var(--team-${key}-on-color-bg)`,
        '--team-color-hover': `var(--team-${key}-color-hover)`,
        '--team-surface-tinted': `color-mix(in srgb, var(--md-sys-color-surface-container) 36%, var(--team-color) 64%)`,
        '--team-surface-high-tinted': `color-mix(in srgb, var(--md-sys-color-surface-container) 16%, var(--team-color) 84%)`,
    }
}

const themeVarsByKey: Record<string, Record<string, string>> = {
    first: buildThemeVars('first'),
    second: buildThemeVars('second'),
}

export function getTeamTheme(teamSlot: number) {
    const key = themeKeyMap[teamSlot] ?? 'first'
    return { themeVars: themeVarsByKey[key] }
}
