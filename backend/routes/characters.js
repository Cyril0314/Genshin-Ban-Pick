// routes/characters.js

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 角色資料
router.get('/api/characters', (req, res) => {
    const charactersFilePath = path.join(__dirname, '../character/characters.json');
    fs.readFile(charactersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading characters JSON file:', err);
            res.status(500).send('Failed to read characters data');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// 圖片清單
router.get('/api/character/images', (req, res) => {
    const imagesDirectory = path.join(__dirname, '../images');
    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            console.log('Error getting directory information.');
            res.status(500).send('Failed to list images');
        } else {
            let imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/.test(file))
                .map(image => `/images/${image}`);
            res.json(imageFiles);
        }
    });
});

// 測試資料
router.get('/api/data', (req, res) => {
    res.json({
        message: "Here is your data!",
        data: [1, 2, 3, 4, 5]
    });
});

export default router;