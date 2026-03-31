import express, { Router } from "express";
import authRoutes from './authRoutes.js';
import employeeRouter from './employeeRoutes.js';
import departmentRouter from './departmentRoutes.js';

let router = express.Router();

let initWebRoutes = (app) => {

    app.use('/api/v1/auth', authRoutes);

    // Employee Routes 
    app.use('/api/v1/employees', employeeRouter);

    // Department Routes
    app.use('/api/v1/departments', departmentRouter);

    return app.use("/", router);
}

export default initWebRoutes;