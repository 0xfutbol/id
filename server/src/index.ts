import dotenv from 'dotenv';
dotenv.config();

import './config/logging';
import './config/sentry';

import * as Sentry from "@sentry/node";
import cors from 'cors';
import express from 'express';

// Import route modules
import { accountRoutes, adminRoutes, airdropRoutes, authRoutes, onchainRoutes } from './routes';

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy setting for rate limiting and IP detection
app.set('trust proxy', true);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.use('/account', accountRoutes);
app.use('/airdrop', airdropRoutes);
app.use('/onchain', onchainRoutes);

// Error handling
Sentry.setupExpressErrorHandler(app);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});