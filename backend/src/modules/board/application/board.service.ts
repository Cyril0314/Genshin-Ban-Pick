// backend/src/modules/board/application/board.service.ts

import { imageDrop } from '../domain/imageDrop';
import { imageRestore } from '../domain/imageRestore';
import { imageMapReset } from '../domain/imageMapReset';
import { createLogger } from '../../../utils/logger';

import type { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';
import type { IRoomStateRepository } from '../../room';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';

const logger = createLogger('BOARD');

export default class BoardService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    drop(roomId: string, { zoneId, imgId, randomContext }: { zoneId: number; imgId: string; randomContext?: ICharacterRandomContext }) {
        const prevBoardImageMap = this.roomStateRepository.findBoardImageMapById(roomId);
        const prevCharacterRandomContextMap = this.roomStateRepository.findCharacterRandomContextMapById(roomId);
        const { boardImageMap, characterRandomContextMap } = imageDrop(
            prevBoardImageMap,
            prevCharacterRandomContextMap,
            zoneId,
            imgId,
            randomContext,
        );

        logger.debug('CharacterRandomContextMap', characterRandomContextMap);

        this.roomStateRepository.updateBoardImageMapById(roomId, boardImageMap);
        this.roomStateRepository.updateCharacterRandomContextMapById(roomId, characterRandomContextMap);
    }

    restore(roomId: string, zoneId: number) {
        const prevBoardImageMap = this.roomStateRepository.findBoardImageMapById(roomId);
        const prevCharacterRandomContextMap = this.roomStateRepository.findCharacterRandomContextMapById(roomId);
        const { boardImageMap, characterRandomContextMap } = imageRestore(prevBoardImageMap, prevCharacterRandomContextMap, zoneId);

        logger.debug('CharacterRandomContextMap', characterRandomContextMap);

        this.roomStateRepository.updateBoardImageMapById(roomId, boardImageMap);
        this.roomStateRepository.updateCharacterRandomContextMapById(roomId, characterRandomContextMap);
    }

    reset(roomId: string) {
        const prevBoardImageMap = this.roomStateRepository.findBoardImageMapById(roomId);
        const prevCharacterRandomContextMap = this.roomStateRepository.findCharacterRandomContextMapById(roomId);
        const { boardImageMap, characterRandomContextMap } = imageMapReset(prevBoardImageMap, prevCharacterRandomContextMap);

        this.roomStateRepository.updateBoardImageMapById(roomId, boardImageMap);
        this.roomStateRepository.updateCharacterRandomContextMapById(roomId, characterRandomContextMap);
    }

    getImageMap(roomId: string): BoardImageMap | null {
        return this.roomStateRepository.findBoardImageMapById(roomId);
    }
}
