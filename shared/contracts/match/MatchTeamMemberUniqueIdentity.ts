
export type MatchTeamMemberUniqueIdentity =
    | { type: 'Member'; id: number; name: string }
    | { type: 'Guest'; id: number; name: string }
    | { type: 'Name'; name: string };

export type MatchTeamMemberUniqueIdentityKey  =
    | { type: 'Member'; id: number }
    | { type: 'Guest'; id: number }
    | { type: 'Name'; name: string };