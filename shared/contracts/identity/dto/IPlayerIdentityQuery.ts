import type { PlayerIdentity } from '../PlayerIdentity';

export interface IPlayerIdentityQuery {
    type: 'member' | 'guest' | 'name';
    id?: number;
    name?: string;
}

export function toPlayerIdentityQuery(playerIdentity: PlayerIdentity): IPlayerIdentityQuery {
    switch (playerIdentity.type) {
        case 'Guest':
            return { type: 'guest', id: playerIdentity.id };
        case 'Member':
            return { type: 'member', id: playerIdentity.id };
        case 'Name':
            return { type: 'name', name: playerIdentity.name };
    }
}

export function fromPlayerIdentityQuery(query: { type?: unknown; id?: unknown; name?: unknown }): PlayerIdentity | undefined {
    if (query.type === 'name') {
        return typeof query.name === 'string' && query.name.length > 0 ? { type: 'Name', name: query.name } : undefined;
    }
    if (query.type === 'member' || query.type === 'guest') {
        const id = Number(query.id);
        if (!Number.isInteger(id) || id <= 0) return undefined;
        return { type: query.type === 'member' ? 'Member' : 'Guest', id };
    }
    return undefined;
}

