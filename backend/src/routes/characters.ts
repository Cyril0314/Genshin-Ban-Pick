// backend/routes/characters.ts

import express from "express";
import type { Request, Response } from 'express';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 角色資料 API
router.get("/api/characters", (req: Request, res: Response) => {
  const charactersFilePath = path.join(
    __dirname,
    "../character/characters.json"
  );

  fs.readFile(charactersFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading characters JSON file:", err);
      res.status(500).send("Failed to read characters data");
      return;
    }

    try {
      const characters = JSON.parse(data);
      res.json(characters);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(500).send("Invalid JSON format");
    }
  });
});

// 圖片清單 API
router.get("/api/character/images", (req: Request, res: Response) => {
  const imagesDirectory = path.join(__dirname, "../images");

  fs.readdir(imagesDirectory, (err, files) => {
    if (err || !files) {
      console.log("Error getting directory information.", err);
      res.status(500).send("Failed to list images");
      return;
    }

    const imageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((image) => `/images/${image}`);

    res.json(imageFiles);
  });
});

export default router;
