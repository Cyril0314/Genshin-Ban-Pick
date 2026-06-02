import type { PlayerIdentity } from '../../identity/PlayerIdentity';

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

