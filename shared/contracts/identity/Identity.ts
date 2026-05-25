export type Identity =
    | { type: 'Member'; id: number }
    | { type: 'Guest'; id: number };

export function isSameIdentity(a: Identity, b: Identity): boolean {
    return a.type === b.type && a.id === b.id;
}
