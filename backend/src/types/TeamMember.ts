// backend/src/types/TeamMamber.ts

import { IRoomUser } from './IRoomUser.ts';

export type TeamMember = { type: 'ONLINE'; user: IRoomUser } | { type: 'MANUAL'; name: string };

export type TeamMembersMap = Record<number, TeamMember[]>;
