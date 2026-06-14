// src/modules/match/domain/IMatchRepository.ts

import type { IMatchSnapshot } from './IMatchSnapshot';
import type { IMatchLineupSlotLight } from '../types/IMatchLineupSlotLight';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchMove } from '@shared/contracts/match/IMatchMove';
import type { IMatchTimestamp } from '@shared/contracts/match/IMatchTimestamp';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

export interface IMatchRepository {
    findAll(): Promise<IMatch[]>;
    findById(matchId: number): Promise<IMatch | undefined>;

    create(snapshot: IMatchSnapshot): Promise<IMatch>;
    preview(snapshot: IMatchSnapshot): Promise<IMatch>;

    delete(matchId: number): Promise<void>;

    findMatchTeamMembers(playerIdentity?: PlayerIdentity): Promise<TeamMember[]>;

    findMatchTimestamps(timeWindow?: ITimeWindow): Promise<IMatchTimestamp[]>;

    findMatchMoves(timeWindow?: ITimeWindow): Promise<IMatchMove[]>;

    findMatchLineupSlotLights(playerIdentity?: PlayerIdentity): Promise<IMatchLineupSlotLight[]>;
}
