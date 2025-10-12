// src/composables/useTeamTheme.ts

import { computed } from 'vue'

import type { ITeam } from '@/types/ITeam'

const themeKeyMap: Record<number, string> = { 0: "first", 1: "second" }

export function useTeamTheme(teamId: number) {
    const key = themeKeyMap[teamId] ?? "first"

    const themeVars = computed(() => ({
        '--team-bg': `var(--team-${key}-bg)`,
        '--team-on-bg': `var(--team-${key}-on-bg)`,
        '--team-hover': `var(--team-${key}-hover)`,
        '--team-alpha': `var(--team-${key}-alpha)`,
    }))

    return { themeVars }
}
