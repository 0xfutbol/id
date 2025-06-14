import express, { Router } from 'express';
import futbolAirdropController from '../controllers/futbolAirdropController';
import { authenticateJWT } from '../middlewares/auth';

const router: Router = express.Router();

router.get('/allocation', authenticateJWT, futbolAirdropController.getAllocation);
router.get('/allocations', authenticateJWT, futbolAirdropController.getAllocations);
router.post('/claim', express.json(), authenticateJWT, futbolAirdropController.claimAirdrop);

export default router; 