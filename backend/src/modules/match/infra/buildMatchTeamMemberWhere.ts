// src/modules/match/infra/buildMatchTeamMemberWhere.ts

import type { Prisma } from '@prisma/client';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export function buildMatchTeamMemberWhere(playerIdentity: PlayerIdentity): Prisma.MatchTeamMemberWhereInput {
    switch (playerIdentity.type) {
        case 'Member':
            return { memberRef: playerIdentity.id };
        case 'Guest':
            return { guestRef: playerIdentity.id };
        case 'Name':
            return { name: playerIdentity.name };
    }
}
