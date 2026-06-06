// analysis/controller/query/parsePlayerIdentityQuery.ts

import { InvalidFieldsError } from '../../../../errors/AppError';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export function parsePlayerIdentityQuery(query: any): PlayerIdentity | undefined {
    const { type, id, name } = query;

    if (!type) return undefined;

    if (type === 'name') {
        if (typeof name !== 'string' || name.length === 0) throw new InvalidFieldsError();
        return { type: 'Name', name };
    }

    if (type === 'member' || type === 'guest') {
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) throw new InvalidFieldsError();
        return { type: type === 'member' ? 'Member' : 'Guest', id: numericId };
    }

    throw new InvalidFieldsError();
}
