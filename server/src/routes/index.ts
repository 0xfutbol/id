import account from './account';
import admin from './admin';
import airdrop from './airdrop';
import auth from './auth';
import health from './health';
import onchain from './onchain';

// Export all route modules
export const authRoutes = auth;
export const adminRoutes = admin;
export const accountRoutes = account;
export const healthRoutes = health;
export const onchainRoutes = onchain;
export const airdropRoutes = airdrop;

export {
    account, admin, airdrop, auth, health, onchain
};

