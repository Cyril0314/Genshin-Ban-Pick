// backend/src/modules/character/controller/character.controller.ts

import { Request, Response } from 'express';
import CharacterService from '../application/character.service';

export default class CharacterController {
    constructor(private characterService: CharacterService) {}

    fetchCharacters = async(req: Request, res: Response) => {
        const characters = await this.characterService.fetchCharacters();
        res.status(200).json(characters);
    };
}
