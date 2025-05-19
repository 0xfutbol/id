import { validate } from '@telegram-apps/init-data-node';
import { Wallet } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import jwt from 'jsonwebtoken';
import { provider } from '../utils/common/web3';

/**
 * Service for handling authentication-related business logic
 */
const authService = {
  /**
   * Generate a JWT token for a user
   */
  generateToken: (username: string, owner: string): string => {
    const token = jwt.sign(
      { username, owner },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    return token;
  },
  
  /**
   * Verify a JWT token and return the decoded data
   */
  verifyToken: (token: string): { username: string; owner: string } | null => {
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { username: string; owner: string };
      
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  },
  
  /**
   * Check if a user has admin privileges
   */
  isAdmin: (address: string): boolean => {
    const adminAddresses = (process.env.ADMIN_ADDRESSES || '').split(',');
    return adminAddresses.includes(address.toLowerCase());
  },

  /**
   * Validate Telegram init data
   */
  isTelegramInitDataValid: (environment: string, initDataRaw: string): boolean => {
    try {
      const botToken = getBotToken(environment);
      validate(initDataRaw, botToken);
      return true;
    } catch (error) {
      console.error('Error in isTelegramInitDataValid:', error);
      return false;
    }
  },

  /**
   * Generate an Ethereum address from a Telegram ID
   */
  generateAddressFromTelegramId: (telegramId: number): string => {
    const username = `telegram:${telegramId}`;
    const privateKey = keccak256(toUtf8Bytes(`0xFútbolID:${username}`));
    return new Wallet(privateKey, provider).address;
  }
};

/**
 * Get the appropriate Telegram bot token based on environment
 */
function getBotToken(environment: string): string {
  if (environment === 'local') {
    return process.env.TELEGRAM_BOT_TOKEN_LOCAL!;
  }
  if (environment === 'dev') {
    return process.env.TELEGRAM_BOT_TOKEN_DEV!;
  }
  return process.env.TELEGRAM_BOT_TOKEN!;
}

export default authService; 