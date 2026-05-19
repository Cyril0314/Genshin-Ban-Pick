import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import { parsePlayerIdentityQuery } from './parsePlayerIdentityQuery';

export type AnalysisScope =
  | { type: 'Global' }
  | { type: 'Player'; playerIdentity: PlayerIdentity };

export function parseAnalysisScopeQuery(query: any): AnalysisScope | undefined {
  const { scope } = query;

  if (scope === 'global') {
    return { type: 'Global' };
  }

  if (scope === 'player') {
    const playerIdentity = parsePlayerIdentityQuery(query);
    if (!playerIdentity) return undefined;

    return { type: 'Player', playerIdentity };
  }

  return undefined;
}
