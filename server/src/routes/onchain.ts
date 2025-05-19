import express from 'express';
import rateLimit from 'express-rate-limit';
import onchainController from '../controllers/onchainController';

const router = express.Router();

// Create rate limiters with different configurations
const standardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const intensiveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 requests per windowMs for intensive operations
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests for intensive operations, please try again later.' }
});

// Group routes by resource type
const nftRoutes = [
  { path: '/lands/:walletAddress', handler: onchainController.getLands },
  { path: '/packs/:walletAddress', handler: onchainController.getPacks },
  { path: '/players/:walletAddress', handler: onchainController.getPlayers },
  { path: '/scouts/:walletAddress', handler: onchainController.getScouts },
  { path: '/ultras/:walletAddress', handler: onchainController.getUltras },
];

const tokenRoutes = [
  { path: '/token-balances/:walletAddress', handler: onchainController.getTokenBalances }
];

// Apply standard rate limiting to NFT routes
nftRoutes.forEach(route => {
  router.get(route.path, standardLimiter, route.handler);
});

// Apply intensive rate limiting to token routes (more resource-intensive)
tokenRoutes.forEach(route => {
  router.get(route.path, intensiveLimiter, route.handler);
});

export default router; 