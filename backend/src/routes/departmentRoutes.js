import express from 'express';
import departmentController from '../controllers/departmentController';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

let departmentRouter = express.Router();

departmentRouter.use(verifyToken, verifyAdmin);
departmentRouter.get('/', departmentController.getAllDepartments);
departmentRouter.post('/', departmentController.createDepartment);
departmentRouter.put('/:id', departmentController.updateDepartment);
departmentRouter.delete('/:id', departmentController.deleteDepartment);

export default departmentRouter;