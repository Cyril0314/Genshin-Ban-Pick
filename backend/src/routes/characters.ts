// backend/src/routes/characters.ts

import express from "express";

import CharacterService from "../services/CharacterService.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

import type { Request, Response } from 'express';

export default function characterRoutes(characterService: CharacterService) {
  const router = express.Router();

  router.get(
    "/characters",
    asyncHandler(async (req, res) => {
      const data = await characterService.getCharacters();
      res.json(data);
    })
  );

  // Not used now
  router.get(
    "/character/images",
    asyncHandler(async (req, res) => {
      const data = await characterService.getCharacterImages();
      res.json(data);
    })
  );

  return router;
}
