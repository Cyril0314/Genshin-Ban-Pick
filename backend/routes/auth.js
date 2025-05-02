// backend/routes/auth.js

import express from 'express';

const router = express.Router();

router.post('/auth/register', async (req, res) => {
    const { account, password, nickname } = req.body
  
    const hash = await bcrypt.hash(password, 10)
    const result = await db.query(
      'INSERT INTO users (account, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id',
      [account, hash, nickname]
    )
  
    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET!)
    res.json({ id: result.rows[0].id, account, nickname, token })
  })

  export default router;