import express from 'express';
import { authenticateJWT } from '../common/auth';
import { getTonAccountByTonAddress, saveTonAccount } from '../repo/db';

const tonRouter = express.Router();

tonRouter.post('/ton', express.json(), authenticateJWT, async (req: express.Request & { user?: { owner: string } }, res) => {
  const { tonAddress } = req.body;

  if (!tonAddress) {
    return res.status(400).json({ message: "TON address missing" });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const tonAlreadyConnected = await getTonAccountByTonAddress(tonAddress);

    if (!tonAlreadyConnected) {
      await saveTonAccount(tonAddress, req.user.owner);

      res.json({ message: "TON account connected successfully" });
    } else {
      res.status(400).json({ message: "TON account already connected" });
    }
  } catch (error) {
    console.error('Error connecting TON', error);
    res.status(500).json({ message: "Error connecting TON" });
  }
});

export default tonRouter;