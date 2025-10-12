// backend/src/services/CharacterSevice.ts

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { DataNotFound } from "../errors/AppError.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class CharacterService {
    async getCharacters() {
        const filePath = path.join(__dirname, "../character/characters.json");

        try {
            const data = await fs.readFile(filePath, "utf8");
            return JSON.parse(data);
        } catch (error) {
            console.error("[CharacterService] Failed to read characters:", error);
            throw new DataNotFound();
        }
    }

    async getCharacterImages() {
        const filePath = path.join(__dirname, "../images");
        try {
            const files = await fs.readdir(filePath);
            const imageFiles = files
                .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
                .map((image) => `/images/${image}`);
            return imageFiles;
        } catch (error) {
            console.error("[CharacterService] Failed to list images:", error);
            throw new DataNotFound();
        }
    }
}
