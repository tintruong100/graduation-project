import express from 'express';
import employeeController from "../controllers/employeeController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";

let router = express.Router();

router.use(verifyToken, verifyAdmin);
router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
