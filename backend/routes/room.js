// backend/routes/room.js

import express from 'express';
import { numberOfUtility, numberOfBan, numberOfPick, totalRounds } from '../constants/constants.js';
import { banPickFlow } from '../banPickFlow.js';

const router = express.Router();

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