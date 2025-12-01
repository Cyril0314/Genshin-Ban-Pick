// src/modules/shared/ui/composables/useTeamTheme.ts

import { computed } from 'vue'

const themeKeyMap: Record<number, string> = { 0: "first", 1: "second" }

export function useTeamTheme(teamSlot: number) {
    const key = themeKeyMap[teamSlot] ?? "first"

    const themeVars = computed(() => ({
        '--team-color': `var(--team-${key}-color)`,
        '--team-color-rgb': `var(--team-${key}-color-rgb)`,
        '--team-on-color': `var(--team-${key}-on-color)`,
        '--team-color-bg': `var(--team-${key}-color-bg)`,
        '--team-on-color-bg': `var(--team-${key}-on-color-bg)`,
        '--team-color-hover': `var(--team-${key}-color-hover)`,
        '--team-surface-tinted': `color-mix(in srgb, var(--md-sys-color-surface-container) 84%, var(--team-color) 16%)`,
        '--team-surface-high-tinted': `color-mix(in srgb, var(--md-sys-color-surface-container) 60%, var(--team-color) 40%)`
    }))

    return { themeVars }
}
