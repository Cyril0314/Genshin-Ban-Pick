// backend/routes/record.js

import express from 'express';
import { imageState, teamMembersState } from '../socketController.js';

const router = express.Router();

router.post('/api/record', (req, res) => {
    console.log(`imageState ${JSON.stringify(imageState, null, 2)}`)
    console.log(`teamMembersState ${JSON.stringify(teamMembersState, null, 2)}`)
});

export default router;