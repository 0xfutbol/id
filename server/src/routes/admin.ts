import express, { Router } from 'express';
import adminController from '../controllers/adminController';
import { authenticateAdmin } from '../middlewares/auth';

const router: Router = express.Router();

// Mount controller-based routes
router.get('/account/:address', authenticateAdmin, adminController.getAccountDetails);

export default router; 