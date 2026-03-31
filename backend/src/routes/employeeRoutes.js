import express from 'express';
import employeeController from "../controllers/employeeController.js";
import { verifyToken, verifyAdmin, verifyManager } from "../middlewares/authMiddleware.js";

let router = express.Router();

router.use(verifyToken);
router.get('/', verifyAdmin, employeeController.getAllEmployees);
router.post('/', verifyAdmin, employeeController.createEmployee);
router.put('/:id', verifyAdmin, employeeController.updateEmployee);
router.delete('/:id', verifyAdmin, employeeController.deleteEmployee);
router.get('/:department_id', verifyManager, employeeController.getAllEmployeesByDepartment);

export default router;
