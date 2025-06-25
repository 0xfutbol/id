import axios from 'axios';
import {
  getDiscordAccountByAddress,
  getDiscordAccountByDiscordId,
  getReferralCount,
  getTonAccountByAddress,
  getTonAccountByTonAddress,
  getUserByAddress,
  getUserDetailsByAddress,
  saveDiscordAccount,
  saveTonAccount,
  updateUserPiP
} from '../models/db';
import { BaseChainService } from './onchainService/baseService';

/**
 * Service for handling account-related business logic
 */
const accountService = {
  /**
   * Connect a TON address to a user
   */
  connectTonAccount: async (tonAddress: string, userAddress: string): Promise<{ success: boolean; message: string }> => {
    try {
      const userAlreadyConnected = await getTonAccountByAddress(userAddress);
      const tonAlreadyConnected = await getTonAccountByTonAddress(tonAddress);

      if (!userAlreadyConnected && !tonAlreadyConnected) {
        await saveTonAccount(tonAddress, userAddress);
        return { success: true, message: "TON account connected successfully" };
      } 
      
      if (userAlreadyConnected && !tonAlreadyConnected) {
        console.warn(`User ${userAddress} already connected to a TON account other than ${tonAddress}`);
        return { success: false, message: "TON account already connected" };
      } 
      
      return { success: false, message: "TON account already connected" };
    } catch (error) {
      console.error('Error connecting TON account:', error);
      throw new Error('Failed to connect TON account');
    }
  },

  /**
   * Get account info for a user
   */
  getAccountInfo: async (userAddress: string): Promise<{
    discord: any;
    pip: string | null;
    referralCount: number;
    ton: any;
    userDetails: Array<{
      id?: string;
      email?: string;
      phone?: string;
    }> | null;
  }> => {
    try {
      const discordAccount = await getDiscordAccountByAddress(userAddress);
      const referralCount = await getReferralCount(userAddress);
      const tonAccount = await getTonAccountByAddress(userAddress);
      const user = await getUserByAddress(userAddress);
      const userDetails = await getUserDetailsByAddress(userAddress);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        discord: discordAccount,
        pip: user.pip || null,
        referralCount,
        ton: tonAccount,
        userDetails,
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw new Error('Failed to fetch account info');
    }
  },

  /**
   * Get public account info for a user by address
   */
  getPublicAccountInfo: async (address: string): Promise<{
    discord: string | null;
    pip: string | null;
    username: string;
  }> => {
    const user = await getUserByAddress(address);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const discordAccount = await getDiscordAccountByAddress(address);

    return {
      discord: discordAccount?.discord_id || null,
      pip: user.pip || null,
      username: user.username,
    };
  },

  /**
   * Connect a Discord account to a user
   */
  connectDiscordAccount: async (code: string, redirectUri: string, userAddress: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> => {
    try {
      const discordAuth = await authenticate(code, redirectUri);
      const { access_token } = discordAuth.data;
      const discordUser = await fetchUser(access_token);

      const discordAlreadyConnected = await getDiscordAccountByDiscordId(discordUser.data.id);

      if (!discordAlreadyConnected) {
        await saveDiscordAccount(discordUser.data.id, userAddress, discordUser.data);
        // Optionally add role assignment here if needed
        // await giveRole(discordUser.data.id);

        return { 
          success: true, 
          message: "Discord account connected successfully", 
          data: discordUser.data 
        };
      } else {
        return { success: false, message: "Discord account already connected" };
      }
    } catch (error) {
      console.error('Error connecting Discord account:', error);
      throw new Error('Failed to connect Discord account');
    }
  },

  /**
   * Update user's PiP (Profile Image Picture)
   */
  updatePiP: async (userAddress: string, tokenId: string): Promise<{ success: boolean; message: string; accountInfo?: any }> => {
    try {
      const baseService = new BaseChainService();
      const ultras = await baseService.getUltras({ walletAddress: userAddress });
      const selectedUltra = ultras.find(ultra => ultra.tokenId === tokenId);
      
      if (!selectedUltra) {
        return { success: false, message: "Token ID not found or not owned by this address" };
      }

      await updateUserPiP(userAddress, selectedUltra.image);

      // Reload account info after successful update
      const accountInfo = await accountService.getAccountInfo(userAddress);
      return { success: true, message: "PiP updated successfully", accountInfo };
    } catch (error) {
      console.error('Error updating PiP:', error);
      throw new Error('Failed to update PiP');
    }
  }
};

/**
 * Authenticate with Discord OAuth
 */
async function authenticate(code: string, redirectUri: string) {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  
  return await axios.post(
    "https://discord.com/api/oauth2/token",
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
}

/**
 * Fetch Discord user data
 */
async function fetchUser(accessToken: string) {
  return await axios.get("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

/**
 * Assign a role to a Discord user (if needed)
 */
async function giveRole(userId: string) {
  const botToken = process.env.DISCORD_BOT_TOKEN!;
  const roleId = "1229234774254686350";
  const guildId = "953005818394050570";
  
  try {
    await axios.put(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {},
      {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

export default accountService; 