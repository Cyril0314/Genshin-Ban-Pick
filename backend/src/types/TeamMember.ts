// backend/src/types/TeamMamber.ts

import { IRoomUser } from './IRoomUser.ts';

export type TeamMember = { type: 'Online'; user: IRoomUser } | { type: 'Manual'; name: string };

export type TeamMembersMap = Record<number, TeamMember[]>;
