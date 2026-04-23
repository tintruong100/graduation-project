import express from 'express';
import attendanceController from '../controllers/attendanceController.js';
import { verifyToken, verifyAdmin, verifyEmployee } from '../middlewares/authMiddleware.js';

let attendanceRouter = express.Router();

attendanceRouter.use(verifyToken);

attendanceRouter.get('/daily-all', verifyAdmin, attendanceController.getDailySummaryAll);
attendanceRouter.post('/trigger-finalize', verifyAdmin, attendanceController.triggerManualFinalize);
attendanceRouter.get('/daily/:employee_id', verifyEmployee, attendanceController.getDailyAttendance);
attendanceRouter.get('/monthly/:employee_id', verifyEmployee, attendanceController.getMonthlyAttendance);

export default attendanceRouter;