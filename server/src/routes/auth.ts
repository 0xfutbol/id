import express, { Router } from 'express';
import authController from '../controllers/authController';

const router: Router = express.Router();

// Mount controller-based routes
router.post('/claim', express.json(), authController.claimUsername);
router.post('/jwt', express.json(), authController.generateJwt);
router.post('/jwt/tg', express.json(), authController.generateJwtTg);
router.post('/pre', express.json(), authController.checkPre);
router.post('/sign', express.json(), authController.generateSignature);
router.post('/validate', express.json(), authController.validateUsername);
router.post('/register/password', express.json(), authController.registerPassword);
router.post('/login/password', express.json(), authController.loginPassword);

export default router; 
