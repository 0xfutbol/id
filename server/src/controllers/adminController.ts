import { Request, Response } from 'express';
import accountService from '../services/accountService';

/**
 * Admin controller with methods for handling admin-only endpoints
 */
export const adminController = {
  // Get detailed account info as an admin
  getAccountDetails: async (req: Request, res: Response) => {
    try {
      const info = await accountService.getAccountInfo(req.params.address);
      res.json(info);
    } catch (error) {
      res.status(500).json({ message: "Error fetching account info" });
    }
  },
  updateAccountEmails: async (req: Request, res: Response) => {
    try {
      const { emails } = req.body;
      const result = await accountService.updateEmails(req.params.address, emails);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error updating account emails" });
    }
  }
};

export default adminController; 