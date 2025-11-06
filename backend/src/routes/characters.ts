// backend/src/routes/characters.ts

import express from "express";

import CharacterService from "../services/CharacterService.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export default function characterRoutes(characterService: CharacterService) {
  const router = express.Router();

  router.get(
    "/characters",
    asyncHandler(async (req, res) => {
      const data = await characterService.getCharacters();
      res.json(data);
    })
  );

  return router;
}
