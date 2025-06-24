import express, { Router } from 'express';
import accountController from '../controllers/accountController';
import { authenticateJWT } from '../middlewares/auth';

const router: Router = express.Router();

// Public routes (no authentication required)
router.post('/ping', express.json(), accountController.pingAddress);
router.get('/username/:username', accountController.getPublicAccountInfoByUsername);
router.get('/resolve/:address', accountController.resolveAddressToUsername);
router.get('/:address', accountController.getPublicAccountInfo);

// Authenticated routes
router.get('/info', authenticateJWT, accountController.getAccountInfo);
router.post('/ton', express.json(), authenticateJWT, accountController.connectTon);
router.post('/discord', express.json(), authenticateJWT, accountController.connectDiscord);
router.post('/pip', express.json(), authenticateJWT, accountController.updatePiP);

export default router;