// shared/contracts/player/IPlayerProfile.ts
//
// 玩家身分 + 顯示資訊。
// caller 端傳給 UI / composable 的標準型別；
// 未來會替換 IRoomUser、chat message、team member 等 data source 內的
// 「identityKey + nickname 二欄位」表達。

import type { PlayerIdentity } from './PlayerIdentity';

export interface IPlayerProfile {
    identity: PlayerIdentity;
    displayName: string;
}
