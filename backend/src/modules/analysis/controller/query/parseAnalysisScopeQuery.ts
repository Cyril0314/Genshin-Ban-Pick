import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';
import { parsePlayerIdentityQuery } from './parsePlayerIdentityQuery';

export type AnalysisScope =
  | { type: 'Global' }
  | { type: 'Player'; identityKey: PlayerIdentity };

export function parseAnalysisScopeQuery(query: any): AnalysisScope | undefined {
  const { scope } = query;

  if (scope === 'global') {
    return { type: 'Global' };
  }

  if (scope === 'player') {
    const identityKey = parsePlayerIdentityQuery(query);
    if (!identityKey) return undefined;

    return { type: 'Player', identityKey };
  }

  return undefined;
}
