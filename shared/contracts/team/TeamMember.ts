export type TeamMember =
    | { type: 'Member'; id: number; nickname: string }
    | { type: 'Guest'; id: number; nickname: string }
    | { type: 'Name'; name: string };
