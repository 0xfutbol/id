import { Request, Response } from 'express';
import { onchainService } from '../services/onchainService';
import { BlockchainError } from '../services/onchainService/types';
import { validateWalletAddress } from '../services/onchainService/utils';

/**
 * Onchain controller with methods for handling blockchain-related operations
 */
export const onchainController = {
  /**
   * Get lands NFTs for a wallet address across all supported chains
   */
  async getLands(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress || !validateWalletAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }

      const lands = await onchainService.fetchLandsFromMultipleChains({
        walletAddress
      });

      return res.json(lands);
    } catch (error) {
      if (error instanceof BlockchainError) {
        return res.status(400).json({ 
          error: error.message,
          code: error.code,
          chain: error.chain
        });
      }
      console.error('Error fetching lands:', error);
      return res.status(500).json({ error: 'Failed to fetch lands' });
    }
  },

  /**
   * Get packs for a wallet address across all supported chains
   */
  async getPacks(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress || !validateWalletAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }

      const packs = await onchainService.fetchPacksFromMultipleChains({
        walletAddress
      });

      return res.json(packs);
    } catch (error) {
      if (error instanceof BlockchainError) {
        return res.status(400).json({ 
          error: error.message,
          code: error.code,
          chain: error.chain
        });
      }
      console.error('Error fetching packs:', error);
      return res.status(500).json({ error: 'Failed to fetch packs' });
    }
  },

  /**
   * Get players NFTs for a wallet address across all supported chains
   */
  async getPlayers(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress || !validateWalletAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }

      const players = await onchainService.fetchPlayersFromMultipleChains({
        walletAddress
      });

      return res.json(players);
    } catch (error) {
      if (error instanceof BlockchainError) {
        return res.status(400).json({ 
          error: error.message,
          code: error.code,
          chain: error.chain
        });
      }
      console.error('Error fetching players:', error);
      return res.status(500).json({ error: 'Failed to fetch players' });
    }
  },

  /**
   * Get scouts NFTs for a wallet address across all supported chains
   */
  async getScouts(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress || !validateWalletAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }

      const scouts = await onchainService.fetchScoutsFromMultipleChains({
        walletAddress,
      });

      return res.json(scouts);
    } catch (error) {
      if (error instanceof BlockchainError) {
        return res.status(400).json({ 
          error: error.message,
          code: error.code,
          chain: error.chain
        });
      }
      console.error('Error fetching scouts:', error);
      return res.status(500).json({ error: 'Failed to fetch scouts' });
    }
  },

  /**
   * Get token balances for a wallet address across all supported chains
   */
  async getTokenBalances(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress || !validateWalletAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }

      const balances = await onchainService.fetchTokenBalancesFromMultipleChains({
        walletAddress,
      });

      return res.json(balances);
    } catch (error) {
      if (error instanceof BlockchainError) {
        return res.status(400).json({ 
          error: error.message,
          code: error.code,
          chain: error.chain
        });
      }
      console.error('Error fetching token balances:', error);
      return res.status(500).json({ error: 'Failed to fetch token balances' });
    }
  },

  /**
   * Get ultras NFTs for a wallet address across all supported chains
   */
  async getUltras(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress || !validateWalletAddress(walletAddress)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }

      const ultras = await onchainService.fetchUltrasFromMultipleChains({
        walletAddress
      });

      return res.json(ultras);
    } catch (error) {
      if (error instanceof BlockchainError) {
        return res.status(400).json({ 
          error: error.message,
          code: error.code,
          chain: error.chain
        });
      }
      console.error('Error fetching ultras:', error);
      return res.status(500).json({ error: 'Failed to fetch ultras' });
    }
  },
};

export default onchainController; 