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
      console.error('Error fetching account info:', error);
      res.status(500).json({ message: "Error fetching account info" });
    }
  }
};

export default adminController; 