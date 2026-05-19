// shared/contracts/identity/PlayerIdentity.ts

import type { Identity } from "./Identity";

export type PlayerIdentity =
    | Identity
    | { type: 'Name'; name: string };

    
export function stringifyPlayerIdentity(playerIdentity: PlayerIdentity): string {
    switch (playerIdentity.type) {
        case 'Member': return `Member:${playerIdentity.id}`;
        case 'Guest':  return `Guest:${playerIdentity.id}`;
        case 'Name':   return `Name:${encodeURIComponent(playerIdentity.name)}`;
    }
}

export function parsePlayerIdentity(s: string): PlayerIdentity | undefined {
    const idx = s.indexOf(':');
    if (idx <= 0) return undefined;
    const tag = s.slice(0, idx);
    const rest = s.slice(idx + 1);

    if (tag === 'Member' || tag === 'Guest') {
        const id = Number(rest);
        if (!Number.isInteger(id) || id <= 0) return undefined;
        return { type: tag, id };
    }
    if (tag === 'Name') {
        const name = decodeURIComponent(rest);
        if (!name) return undefined;
        return { type: 'Name', name };
    }
    return undefined;
}
