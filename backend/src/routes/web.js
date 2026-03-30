import express, { Router } from "express";
import homeController from "../controllers/homeController.js";
import authRoutes from './authRoutes.js';
import employeeController from "../controllers/employeeController.js";
import departmentController from "../controllers/departmentController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage);

    app.use('/api/v1/auth', authRoutes);

    // Employee Routes 
    let employeeRouter = express.Router();
    employeeRouter.use(verifyToken, verifyAdmin);
    employeeRouter.get('/', employeeController.getAllEmployees);
    employeeRouter.post('/', employeeController.createEmployee);
    employeeRouter.put('/:id', employeeController.updateEmployee);
    employeeRouter.delete('/:id', employeeController.deleteEmployee);
    app.use('/api/v1/employees', employeeRouter);

    // Department Routes
    let departmentRouter = express.Router();
    departmentRouter.use(verifyToken, verifyAdmin);
    departmentRouter.get('/', departmentController.getAllDepartments);
    departmentRouter.post('/', departmentController.createDepartment);
    departmentRouter.put('/:id', departmentController.updateDepartment);
    departmentRouter.delete('/:id', departmentController.deleteDepartment);
    app.use('/api/v1/departments', departmentRouter);

    return app.use("/", router);
}

export default initWebRoutes;