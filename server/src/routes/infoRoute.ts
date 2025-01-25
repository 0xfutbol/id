import express from 'express';
import { authenticateJWT } from '../common/auth';
import { getDiscordAccountByAddress, getReferralCount, getTonAccountByTonAddress, getUserByAddress } from '../repo/db';

const infoRouter = express.Router();

infoRouter.get('/info', authenticateJWT, async (req: express.Request & { user?: { owner: string } }, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const discordAccount = await getDiscordAccountByAddress(req.user.owner);
    const tonAccount = await getTonAccountByTonAddress(req.user.owner);
    const referralCount = await getReferralCount(req.user.owner);

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

infoRouter.get('/:address', async (req, res) => {
  const address = req.params.address;

  try {
    const user = await getUserByAddress(address);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const discordAccount = await getDiscordAccountByAddress(address);

    const info = {
      username: user.username,
      discord: discordAccount?.discord_id
    };

    res.json(info);
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ message: "Error fetching account info" });
  }
});

export default infoRouter;