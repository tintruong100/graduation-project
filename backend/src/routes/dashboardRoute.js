import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { verifyToken, verifyAdmin, verifyEmployee, verifyManager } from '../middlewares/authMiddleware.js';

let dashboardRouter = express.Router();

dashboardRouter.use(verifyToken, verifyAdmin);

dashboardRouter.get('/summary', dashboardController.getSummary);

export default dashboardRouter;