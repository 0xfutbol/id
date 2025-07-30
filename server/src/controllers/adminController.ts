import { Request, Response } from 'express';
import { db } from '../models/db';
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
  // Copy emails from users_details to users_emails, creating table if necessary
  migrateEmails: async (req: Request, res: Response) => {
    try {
      console.log('Starting email migration...');
      const usersDetails = await db('users_details').select('address', 'details');
      console.log(`Fetched ${usersDetails.length} user details records.`);

      for (const ud of usersDetails) {
        console.log(`Processing address: ${ud.address}`);
        let details;
        try {
          details = ud.details;
        } catch (e) {
          console.error(`Error parsing details for ${ud.address}: ${(e as Error).message}`);
          continue;
        }
        if (!Array.isArray(details)) {
          console.log(`Details for ${ud.address} is not an array, skipping.`);
          continue;
        }

        const emails = details
          .filter(item => item.email && typeof item.email === 'string')
          .map(item => ({
            address: ud.address,
            email: item.email
          }));

        if (emails.length > 0) {
          await db('users_emails').insert(emails).onConflict(['address', 'email']).ignore();
          console.log(`Inserted ${emails.length} emails for ${ud.address}`);
        } else {
          console.log(`No valid emails found for ${ud.address}`);
        }
      }

      console.log('Email migration completed successfully.');
      res.json({ message: 'Emails copied successfully' });
    } catch (error) {
      console.error('Error during email migration:', error);
      res.status(500).json({ message: 'Error copying emails', error: (error as Error).message });
    }
  }
};

export default adminController; 