import express from 'express';
import { authenticateJWT } from '../common/auth';
import { getDiscordAccountByAddress, getReferralCount } from '../repo/db';

const infoRouter = express.Router();

infoRouter.get('/info', authenticateJWT, async (req: express.Request & { user?: { owner: string } }, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const discordAccount = await getDiscordAccountByAddress(req.user.owner);
    const referralCount = await getReferralCount(req.user.owner);

    const info = {
      discord: discordAccount,
      referralCount
    };

    res.json(info);
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ message: "Error fetching account info" });
  }
});

export default infoRouter;