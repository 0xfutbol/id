import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { saveAirdropClaim } from '../models/db';
import airdropService from '../services/airdropService';

const futbolAirdropController = {
  // Get allocation and message to sign
  getAllocation: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const allocationResult = await airdropService.getAllocation(req.user.owner);
      if (!allocationResult) {
        return res.status(404).json({ message: 'No allocation found' });
      }
      return res.json(allocationResult);
    } catch (err) {
      console.error('[futbolAirdropController] Error fetching allocation', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Claim airdrop
  claimAirdrop: async (req: AuthRequest, res: Response) => {
    const { message, signature } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!message || !signature) {
      return res.status(400).json({ message: 'Message and signature are required' });
    }

    try {
      const address = req.user.owner;
      const allocationResult = await airdropService.getAllocation(address);
      if (!allocationResult) {
        return res.status(404).json({ message: 'No allocation found' });
      }

      // Verify signature
      const isValid = airdropService.verifySignature(message, signature, address);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid signature' });
      }

      // Persist claim (ignore if already claimed)
      await saveAirdropClaim(
        address,
        allocationResult.strategy,
        allocationResult.allocation,
        message,
        signature,
        allocationResult.telegramId,
      );

      // Notify webhook (fire and forget)
      airdropService.notifyWebhook({ address, strategy: allocationResult.strategy });

      return res.json({ success: true });
    } catch (err) {
      console.error('[futbolAirdropController] Error claiming airdrop', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default futbolAirdropController; 