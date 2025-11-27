import type { IRoomUser } from "../room/IRoomUser";

export type TeamMember = { type: 'Online'; user: IRoomUser } | { type: 'Manual'; name: string };