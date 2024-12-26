import { ethers } from 'ethers';
import express from 'express';
import { getAddress, saveAddress } from '../repo/db';

const pingRouter = express.Router();

pingRouter.post('/ping', express.json(), async (req, res) => {
  const { address, referrer } = req.body;

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  try {
    const existingAddress = await getAddress(address);

    if (!existingAddress) {
      const trimmedReferrer = referrer ? referrer.replace(/^"|"$/g, '') : undefined;
      await saveAddress(address, trimmedReferrer);
    }

    res.json({ message: "Pong!" });
  } catch (error) {
    console.error('Error in ping route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default pingRouter;