import type { PlayerIdentity } from '../identity/PlayerIdentity';

export type TeamMember =
    | (Extract<PlayerIdentity, { type: 'Member' }> & { nickname: string })
    | (Extract<PlayerIdentity, { type: 'Guest' }> & { nickname: string })
    | Extract<PlayerIdentity, { type: 'Name' }>;
