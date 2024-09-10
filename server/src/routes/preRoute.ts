import express from 'express';
import { getUserByAddress } from '../repo/db';

const preRouter = express.Router();

preRouter.post('/pre', express.json(), async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const user = await getUserByAddress(address);

    if (user) {
      res.json({ username: user.username });
    } else {
      res.json({ username: null });
    }
  } catch (error) {
    console.error('Error checking address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default preRouter;