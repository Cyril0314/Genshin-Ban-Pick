// src/types/TeamMember.ts

import type { IRoomUser } from './IRoomUser';

export type TeamMember = { type: 'Online'; user: IRoomUser } | { type: 'Manual'; name: string };

export type TeamMembersMap = Record<number, Record<number, TeamMember>>;
