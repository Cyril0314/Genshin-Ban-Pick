// shared/contracts/player/PlayerIdentity.ts
//
// 玩家身分的純參照（無 display info、無 presence）。
// 與 IPlayerProfile 搭配：profile = identity + displayName。

export type PlayerIdentity =
    | { type: 'Member'; id: number }
    | { type: 'Guest'; id: number }
    | { type: 'Name'; name: string };
