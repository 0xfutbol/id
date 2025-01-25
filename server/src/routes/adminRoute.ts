import express from 'express';
import { authenticateAdmin } from '../common/auth';
import { getDiscordAccountByAddress, getReferralCount, getTonAccountByTonAddress } from '../repo/db';

const adminRouter = express.Router();

adminRouter.get('/account/:address', authenticateAdmin, async (req: express.Request & { user?: { owner: string } }, res) => {
  try {
    const discordAccount = await getDiscordAccountByAddress(req.params.address);
    const tonAccount = await getTonAccountByTonAddress(req.params.address);
    const referralCount = await getReferralCount(req.params.address);

    const info = {
      discord: discordAccount,
      ton: tonAccount,
      referralCount
    };

    res.json(info);
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ message: "Error fetching account info" });
  }
});

export default adminRouter;