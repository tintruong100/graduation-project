import express from 'express';
import authController from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

let router = express.Router();

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);
router.put('/change-password', verifyToken, authController.changePassword);

export default router;
