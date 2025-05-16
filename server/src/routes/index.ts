import account from './account';
import admin from './admin';
import auth from './auth';

// Export all route modules
export const authRoutes = auth;
export const adminRoutes = admin;
export const accountRoutes = account;

export {
    account, admin, auth
};
