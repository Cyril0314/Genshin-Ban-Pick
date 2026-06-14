// src/modules/player/index.ts

import PlayerService from './application/player.service';
import PlayerController from './controller/player.controller';
import createPlayersRouter from './http/players.routes';

import type { IMatchRepository } from '../match/domain/IMatchRepository';
import type { IPlayerMatchReadModel } from '../match/domain/IPlayerMatchReadModel';
import type UserService from '../user/application/user.service';

export function createPlayerModule(
    matchRepository: IMatchRepository,
    playerMatchReadModel: IPlayerMatchReadModel,
    userService: UserService,
) {
    const service = new PlayerService(matchRepository, playerMatchReadModel, userService);
    const controller = new PlayerController(service);
    const router = createPlayersRouter(controller);

    return { router, controller, service };
}
