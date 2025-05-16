import express, { Router } from 'express';
import authController from '../controllers/authController';

const router: Router = express.Router();

// Mount controller-based routes
router.post('/validate', express.json(), authController.validateUsername);
router.post('/jwt', express.json(), authController.generateJwt);
router.post('/claim', express.json(), authController.claimUsername);
router.post('/sign', express.json(), authController.generateSignature);
router.post('/pre', express.json(), authController.checkPre);
router.post('/jwt/tg', express.json(), authController.generateJwtTg);

export default router; 