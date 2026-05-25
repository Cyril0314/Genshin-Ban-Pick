import type { Identity } from '../identity/Identity';
import type { MemberRole } from './value_types';

export type Principal =
    | (Extract<Identity, { type: 'Member' }> & { role: MemberRole })
    | Extract<Identity, { type: 'Guest' }>;
