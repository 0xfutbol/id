import express, { Router } from 'express';
import accountController from '../controllers/accountController';
import { authenticateJWT } from '../middlewares/auth';

const router: Router = express.Router();

// Mount controller-based routes
router.get('/info', authenticateJWT, accountController.getAccountInfo);
router.get('/:address', accountController.getPublicAccountInfo);

router.post('/discord', express.json(), authenticateJWT, accountController.connectDiscord);
router.post('/ping', express.json(), accountController.pingAddress);
router.post('/pip', express.json(), authenticateJWT, accountController.updatePiP);
router.post('/ton', express.json(), authenticateJWT, accountController.connectTon);

export default router;