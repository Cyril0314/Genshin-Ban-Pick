
export type MatchTeamMemberUniqueIdentity =
    | { type: 'Member'; id: number; name: string }
    | { type: 'Guest'; id: number; name: string }
    | { type: 'Name'; name: string };