import express from 'express';
import securityAlertController from '../controllers/securityAlertController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

let securityAlertRouter = express.Router();

securityAlertRouter.use(verifyToken, verifyAdmin);

securityAlertRouter.get('/', securityAlertController.getAlerts);

export default securityAlertRouter;