// backend/src/types/TeamMamber.ts

import { IRoomUser } from "../modules/room/index.ts";

export type TeamMember = { type: 'Online'; user: IRoomUser } | { type: 'Manual'; name: string };

export type TeamMembersMap = Record<number, Record<number, TeamMember>>;
