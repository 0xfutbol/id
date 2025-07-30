import { isAddress } from 'ethers/lib/utils';
import { Request, Response } from 'express';
import { getAddress, saveAddress } from '../models/db';
import accountService from '../services/accountService';

/**
 * Account controller with methods for handling account-related endpoints
 */
export const accountController = {
  // Connect TON address to account
  connectTon: async (req: Request & { user?: { owner: string } }, res: Response) => {
    const { tonAddress } = req.body;

    if (!tonAddress) {
      return res.status(400).json({ message: "TON address missing" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const result = await accountService.connectTonAccount(tonAddress, req.user.owner);
      return res.json({ message: result.message });
    } catch (error) {
      console.error('Error connecting TON', error);
      res.status(500).json({ message: "Error connecting TON" });
    }
  },

  // Get account info for authenticated user
  getAccountInfo: async (req: Request & { user?: { owner: string } }, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const info = await accountService.getAccountInfo(req.user.owner);
      res.json(info);
    } catch (error) {
      console.error('Error fetching account info:', error);
      res.status(500).json({ message: "Error fetching account info" });
    }
  },

  // Get public account info by address
  getPublicAccountInfo: async (req: Request, res: Response) => {
    const address = req.params.address;

    try {
      const info = await accountService.getPublicAccountInfo(address);
      res.json(info);
    } catch (error) {
      if ((error as Error).message === 'User not found') {
        return res.status(404).json({ message: "User not found" });
      }
      console.error('Error fetching account info:', error);
      res.status(500).json({ message: "Error fetching account info" });
    }
  },

  // Ping route for recording addresses
  pingAddress: async (req: Request, res: Response) => {
    const { address, referrer } = req.body;

    if (!isAddress(address)) {
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
  },

  // Connect Discord account
  connectDiscord: async (req: Request & { user?: { owner: string } }, res: Response) => {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Auth code missing" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const result = await accountService.connectDiscordAccount(code, redirectUri, req.user.owner);
      if (result.success) {
        res.json({ message: result.message, data: result.data });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error('Error connecting Discord', error);
      res.status(500).json({ message: "Error connecting Discord" });
    }
  },

  updateEmails: async (req: Request & { user?: { owner: string } }, res: Response) => {
    const { emails } = req.body;
    if (!emails) {
      return res.status(400).json({ message: "Emails are required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const result = await accountService.updateEmails(req.user.owner, emails);
      res.json({ message: result.message, data: result.data });
    } catch (error) {
      console.error('Error updating emails', error);
      res.status(500).json({ message: "Error updating emails" });
    }
  },

  // Update Profile Image Picture (PiP)
  updatePiP: async (req: Request & { user?: { owner: string } }, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ message: "Token ID is required" });
    }

    try {
      const result = await accountService.updatePiP(req.user.owner, tokenId);
      if (result.success) {
        res.json({ message: result.message, accountInfo: result.accountInfo });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error('Error updating PiP:', error);
      res.status(500).json({ message: "Error updating PiP" });
    }
  }
};

export default accountController; 