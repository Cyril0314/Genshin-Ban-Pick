// backend/src/modules/analysis/domain/playerDisplayName.ts
//
// 把 PlayerIdentity 對應到顯示名稱的規則。
// 純函式：lookup 結果由 service orchestrate（auth 模組查 Member / Guest），這裡只負責「拿到值之後怎麼決定 displayName」。

import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';

export interface PlayerNameLookup {
    memberNickname?: string;
    guestNickname?: string;
}

export function playerDisplayName(identity: PlayerIdentity, lookup: PlayerNameLookup): string {
    switch (identity.type) {
        case 'Name': return identity.name;
        case 'Member': return lookup.memberNickname ?? `Member#${identity.id}`;
        case 'Guest': return lookup.guestNickname ?? `Guest#${identity.id}`;
    }
}
