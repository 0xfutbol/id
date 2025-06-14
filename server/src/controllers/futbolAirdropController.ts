import { isAddress } from 'ethers/lib/utils';
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

  // Get all allocations (may include multiple strategies)
  getAllocations: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const allocations = await airdropService.getAllocations(req.user.owner);
      if (!allocations || allocations.length === 0) {
        return res.status(404).json({ message: 'No allocation found' });
      }
      return res.json(allocations);
    } catch (err) {
      console.error('[futbolAirdropController] Error fetching allocations', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Claim airdrop
  claimAirdrop: async (req: AuthRequest, res: Response) => {
    const { message, signature, destinationAddress } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!message || !signature || !destinationAddress) {
      return res.status(400).json({ message: 'Message, signature and destinationAddress are required' });
    }
    if (!isAddress(destinationAddress)) {
      return res.status(400).json({ message: 'Invalid destination address' });
    }

    try {
      const address = req.user.owner;
      const allocations = await airdropService.getAllocations(address);
      const allocationResult = allocations.find((a) => a.message === message);
      if (!allocationResult) {
        return res.status(404).json({ message: 'Allocation not found for provided message' });
      }

      // Verify signature
      const isValid = airdropService.verifySignature(message, signature, address);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid signature' });
      }

      // Persist claim (ignore if already claimed)
      await saveAirdropClaim(
        address,
        allocationResult.strategy!,
        allocationResult.allocation!,
        message,
        signature,
        destinationAddress,
        allocationResult.telegramId,
      );

      // Notify webhook (fire and forget)
      airdropService.notifyWebhook({ address, destinationAddress, strategy: allocationResult.strategy });

      return res.json({ success: true });
    } catch (err) {
      console.error('[futbolAirdropController] Error claiming airdrop', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default futbolAirdropController; 