// src/modules/auth/types/Identity.ts

import type { IMember } from './IMember';
import type { IGuest } from './IGuest';

export type Identity = { type: 'Member'; user: IMember } | { type: 'Guest'; user: IGuest };