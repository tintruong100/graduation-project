import express from 'express';
import fingerprintController from '../controllers/fingerprintController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

let fingerprintRouter = express.Router();

fingerprintRouter.use(verifyToken, verifyAdmin);
fingerprintRouter.get('/', fingerprintController.getAllFingerprints);
fingerprintRouter.post('/', fingerprintController.scanAndCreateFingerprint);
fingerprintRouter.put('/:id', fingerprintController.updateFingerprint);
fingerprintRouter.delete('/:id', fingerprintController.deleteFingerprint);
fingerprintRouter.get('/scan-log', fingerprintController.getAllScanLog);

export default fingerprintRouter;