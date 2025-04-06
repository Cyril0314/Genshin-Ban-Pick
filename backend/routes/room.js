import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { numberOfUtility, numberOfBan, numberOfPick, totalRounds } from '../constants/constants.js';
import { banPickFlow } from '../banPickFlow.js';


const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/api/room-setting', (req, res) => {
    res.json({
        "numberOfUtility": numberOfUtility,
        "numberOfBan": numberOfBan,
        "numberOfPick": numberOfPick,
        "totalRounds": totalRounds,
        "banPickFlow": banPickFlow
    });
});

export default router;