// shared/contracts/player/identitySerialization.ts
//
// PlayerIdentity ⇄ 字串序列化。
// 格式：Member:<id> / Guest:<id> / Name:<encoded-name>
//   - Member / Guest 維持與既有 auth / socket payload 的 PascalCase + 數字 id 慣例
//   - Name 走 encodeURIComponent 避免 colon、空白、特殊字元造成歧義

import type { PlayerIdentity } from './PlayerIdentity';

export function stringifyIdentity(identity: PlayerIdentity): string {
    switch (identity.type) {
        case 'Member': return `Member:${identity.id}`;
        case 'Guest':  return `Guest:${identity.id}`;
        case 'Name':   return `Name:${encodeURIComponent(identity.name)}`;
    }
}

export function parseIdentity(s: string): PlayerIdentity | undefined {
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
