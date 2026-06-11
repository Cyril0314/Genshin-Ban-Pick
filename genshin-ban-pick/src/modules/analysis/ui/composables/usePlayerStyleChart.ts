// src/modules/analysis/ui/composables/usePlayerStyleChart.ts

import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useUserStore } from '@/modules/user';
import { createLogger } from '@/app/utils/logger';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useMatchUseCase } from '@/modules/match';
import { buildPlayerStyleOption } from './buildPlayerStyleOption';
import { isSameIdentity } from '@shared/contracts/identity/Identity';
import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import { getTeamMemberName } from '@shared/contracts/team/TeamMember';

import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';


const logger = createLogger('analysis.ui.playerStyleChart');

type Scope = { type: 'Player'; player: TeamMember } | { type: 'Global' };

const IDENTITY_ORDER: Record<TeamMember['type'], number> = { Member: 0, Guest: 1, Name: 2 };

export function usePlayerStyleChart() {
    const { tooltipStyle } = useEchartTheme();
    const designTokens = useDesignTokens();
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);

    const analysisUseCase = useAnalysisUseCase();
    const matchUseCase = useMatchUseCase();

    const players = ref<TeamMember[]>([]);

    const scopes = computed<Scope[]>(() => {
        const globalScope: Scope = { type: 'Global' };

        const playerScopes: Scope[] = players.value.map((p) => ({
            type: 'Player',
            player: p,
        }));

        return [globalScope, ...playerScopes];
    });

    const selectedScopeKey = ref<string>();

    const selectedScope = computed({
        get() {
            if (!selectedScopeKey.value) return undefined;
            return scopes.value.find((scope) => getScopeKey(scope) === selectedScopeKey.value);
        },
        set(scope) {
            selectedScopeKey.value = scope ? getScopeKey(scope) : undefined;
        },
    });

    const playerStyle = ref<IPlayerStyleProfile>();
    const characterAttributeDistributions = ref<ICharacterAttributeDistributions>();

    onMounted(async () => {
        const teamMembers = await matchUseCase.fetchMatchTeamMembers();
        players.value = sortPlayersForScopeMenu(teamMembers);
        logger.debug('players loaded', players.value.length);

        const currentUser = user.value;
        const self = !currentUser
            ? undefined
            : players.value.find((player) => {
                if (player.type === 'Name') return false;
                return isSameIdentity(player, currentUser);
            });

        if (self) {
            logger.debug('self found, selecting player scope');
            selectedScope.value = { type: 'Player', player: self };
        } else {
            logger.debug('self not found, selecting global scope');
            selectedScope.value = { type: 'Global' };
        }
    });

    watch(selectedScope, async () => {
        if (!selectedScope.value) return;
        logger.debug('scope changed to', selectedScope.value.type);
        if (selectedScope.value.type === 'Player') {
            playerStyle.value = await analysisUseCase.fetchPlayerStyleProfile(selectedScope.value.player);
            characterAttributeDistributions.value = playerStyle.value?.characterAttributeDistributions;
        } else {
            playerStyle.value = undefined;
            characterAttributeDistributions.value = await analysisUseCase.fetchCharacterAttributeDistributions();
        }
    });

    function getScopeKey(scope: Scope): string {
        return scope.type === 'Global' ? 'Global' : stringifyPlayerIdentity(scope.player);
    }

    const option = computed(() => {
        if (!characterAttributeDistributions.value || !selectedScope.value) return undefined;
        const isGlobal = selectedScope.value.type === 'Global';
        return buildPlayerStyleOption({
            profile: isGlobal ? undefined : playerStyle.value,
            distributions: characterAttributeDistributions.value,
            onSurface: designTokens.colorOnSurface.value,
            onSurfaceVariant: designTokens.colorOnSurfaceVariant.value,
            primary: designTokens.colorPrimary.value,
            tooltip: tooltipStyle('single'),
        });
    });


    function sortPlayersForScopeMenu(players: TeamMember[]): TeamMember[] {
        return [...players].sort((a, b) => {
            const typeDiff = IDENTITY_ORDER[a.type] - IDENTITY_ORDER[b.type];
            if (typeDiff !== 0) return typeDiff;
            return getTeamMemberName(a).localeCompare(getTeamMemberName(b), 'zh-Hant');
        });
    }

    return { scopes, selectedScopeKey, selectedScope, option, getScopeKey };
}
