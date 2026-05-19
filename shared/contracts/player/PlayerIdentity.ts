// shared/contracts/player/PlayerIdentity.ts

import type { Identity } from "../auth/Identity";

export type PlayerIdentity =
    | Identity
    | { type: 'Name'; name: string };
