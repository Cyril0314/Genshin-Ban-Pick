// src/types/TeamMember.ts

import type { IRoomUser } from './IRoomUser';

export type TeamMember = { type: 'ONLINE'; user: IRoomUser } | { type: 'MANUAL'; name: string };

export type TeamMembersMap = Record<number, TeamMember[]>;
