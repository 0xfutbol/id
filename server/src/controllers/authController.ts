import { MAX_SIGNATURE_EXPIRATION } from '@0xfutbol/id-sign';
import { parse } from '@telegram-apps/init-data-node';
import { Request, Response } from 'express';
import { getUserByAddress, getUserByUsername, saveAddress, saveTelegramAccount, saveUserDetails, saveUserEmails, saveUserIfDoesntExists } from '../models/db';
import authService from '../services/authService';
import identityService from '../services/identityService';
import { oxFutboId } from '../utils/common/id';
import { validateUsername } from '../utils/common/utils';
import waasClient from '../utils/common/waasClient';

/**
 * Auth controller with methods for handling authentication endpoints
 * This is a sample of how to structure controllers in the improved architecture
 */
export const authController = {
  // Validate username 
  validateUsername: async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    try {
      const trimmedUsername = username.trim();
      const validationResult = await validateUsername(trimmedUsername);
      if (!validationResult.isValid) {
        return res.status(400).json({ error: validationResult.error });
      }

      const oxFutbolId = await getUserByUsername(trimmedUsername);
      const claimed = oxFutbolId !== null;

      res.json({ claimed });
    } catch (error) {
      console.error('Error checking username:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Generate JWT token
  generateJwt: async (req: Request, res: Response) => {
    const { username, message, loginMethod, expiration } = req.body;

    if (!isValidRequest(username, message, expiration)) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    if (!oxFutboId.isValidSignatureExpiration(expiration)) {
      return res.status(400).json({ error: 'Signature expired or too far in the future' });
    }

    try {
      const oxFutbolId = await getUserByUsername(username);

      if (!oxFutbolId) {
        return res.status(404).json({ error: '0xFútbol ID not found' });
      }

      const owner = oxFutbolId.address;

      await oxFutboId.validateSignature(message, owner, username, expiration);

      const pip = oxFutbolId.pip;
      const token = oxFutboId.createJWT(username, owner, message, expiration, { pip });
      
      // Save the user in the database
      await saveUserIfDoesntExists(owner, username, loginMethod ?? "unknown");

      // Return the token in the JSON response as well
      res.json({ token });
    } catch (error) {
      console.error('Error creating JWT:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Claim username
  claimUsername: async (req: Request, res: Response) => {
    const { username, owner, message, loginMethod, expiration, userDetails, userEmail } = req.body;

    if (!isValidClaimRequest(username, owner, message, expiration)) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    if (!oxFutboId.isValidSignatureExpiration(expiration)) {
      return res.status(400).json({ error: 'Signature expired or too far in the future' });
    }

    try {
      await oxFutboId.validateSignature(message, owner, username, expiration);

      // Save the user in the database
      console.debug("[0xFútbol ID] Registering username:", username);
      await saveUserIfDoesntExists(owner, username, loginMethod ?? userDetails?.provider ?? "unknown");
      console.debug("[0xFútbol ID] Username registered successfully");

      // Save userDetails if provided
      if (userDetails && Array.isArray(userDetails) && userDetails.length > 0) {
        console.debug("[0xFútbol ID] Saving user details:", userDetails);
        await saveUserDetails(owner, userDetails);
        console.debug("[0xFútbol ID] User details saved successfully");
      }

      // Save user email if provided
      if (userEmail) {
        console.debug("[0xFútbol ID] Saving user email:", userEmail);
        await saveUserEmails(owner, [userEmail]);
        console.debug("[0xFútbol ID] User email saved successfully");
      }

      // Return the token in the JSON response as well
      res.json({ success: true });
    } catch (error) {
      console.error('Error in claimUsername route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Generate a signature for claiming
  generateSignature: async (req: Request, res: Response) => {
    const { username, owner } = req.body;

    if (!username || !owner) {
      return res.status(400).json({ error: 'Username and owner address are required' });
    }

    try {
      const existingUserByOwner = await getUserByAddress(owner);
      if (existingUserByOwner) {
        const existingUserByUsername = await getUserByUsername(username);
        if (existingUserByUsername?.address.toLowerCase() === owner.toLowerCase()) {
          const signatureData = await oxFutboId.generateSignature(username, owner);
          return res.json({ ...signatureData, claimed: true });
        }
        return res.status(400).json({ error: 'This address has already claimed another username' });
      }

      const existingUserByUsername = await getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: 'This username has already been claimed' });
      }

      const validationResult = await validateUsername(username);
      if (!validationResult.isValid) {
        return res.status(400).json({ error: validationResult.error });
      }

      const signatureData = await oxFutboId.generateSignature(username, owner);

      return res.json({ ...signatureData, claimed: false });
    } catch (error) {
      console.error('Error in generateSignature method:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Check for pre-existing username
  checkPre: async (req: Request, res: Response) => {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    try {
      const user = await getUserByAddress(address);

      if (user) {
        res.json({ username: user.username });
      } else {
        res.json({ username: null });
      }
    } catch (error) {
      console.error('Error checking address:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Generate JWT for Telegram
  generateJwtTg: async (req: Request, res: Response) => {
    const { environment, initDataRaw, referrerUserId } = req.body;

    if (!initDataRaw) {
      return res.status(400).json({ message: "Init data missing" });
    }

    if (!authService.isTelegramInitDataValid(environment, initDataRaw)) {
      return res.status(400).json({ message: "Init data is invalid" });
    }

    const initData = parse(initDataRaw);

    if (!initData.user) {
      return res.status(400).json({ message: "User is missing" });
    }

    const username = `telegram:${initData.user.id}`;
    const userEvmAddress = authService.generateAddressFromTelegramId(initData.user.id);
    const referrerEvmAddress = referrerUserId ? authService.generateAddressFromTelegramId(referrerUserId) : undefined;

    try {
      await saveAddress(userEvmAddress, referrerEvmAddress);
      await saveTelegramAccount(initData.user.id, initData.user, userEvmAddress);

      const token = oxFutboId.createJWT(username, userEvmAddress, initData.signature, MAX_SIGNATURE_EXPIRATION, initData.user);

      return res.json({ token });
    } catch (error) {
      console.error('Error in generateJwtTg method:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Register with username/password
  registerPassword: async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const result = await identityService.register(username, password);
      const walletId = result.wallet.id;
      const session = await waasClient.createSession(walletId, result.token);
      res.json({
        token: result.token,
        address: result.address,
        wallet: result.wallet,
        waasSessionToken: session.sessionToken,
        waasSessionExpiresAt: session.expiresAt,
      });
    } catch (error: any) {
      console.error('Error registering identity:', error);
      res.status(400).json({ error: error.message ?? 'Failed to register' });
    }
  },

  // Login with username/password
  loginPassword: async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const result = await identityService.login(username, password);
      const session = result.walletId
        ? await waasClient.createSession(result.walletId, result.token)
        : undefined;
      res.json({
        token: result.token,
        address: result.address,
        walletId: result.walletId,
        walletAddress: result.walletAddress,
        waasSessionToken: session?.sessionToken,
        waasSessionExpiresAt: session?.expiresAt,
      });
    } catch (error: any) {
      console.error('Error logging in identity:', error);
      res.status(400).json({ error: error.message ?? 'Failed to login' });
    }
  },
};

function isValidRequest(username: string, signature: string, expiration: number): boolean {
  return Boolean(username && signature && expiration);
}

function isValidClaimRequest(username: string, owner: string, signature: string, expiration: number): boolean {
  return Boolean(username && owner && signature && expiration);
}

export default authController; 
