import account from './account';
import admin from './admin';
import auth from './auth';
import onchain from './onchain';

// Export all route modules
export const authRoutes = auth;
export const adminRoutes = admin;
export const accountRoutes = account;
export const onchainRoutes = onchain;

export {
  account, admin, auth, onchain
};

