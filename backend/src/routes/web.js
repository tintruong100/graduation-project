import express, { Router } from "express";
import authRoutes from './authRoutes.js';
import employeeRouter from './employeeRoutes.js';
import departmentRouter from './departmentRoutes.js';
import fingerprintRouter from './fingerprintRoutes.js';
import attendanceRoutes from './attendanceRoute.js';
import dashboardRouter from './dashboardRoute.js';

let router = express.Router();

let initWebRoutes = (app) => {

    app.use('/api/v1/auth', authRoutes);

    // Employee Routes 
    app.use('/api/v1/employees', employeeRouter);

    // Department Routes
    app.use('/api/v1/departments', departmentRouter);

    // Fingerprint Routes
    app.use('/api/v1/fingerprints', fingerprintRouter);

    // Attendance Routes
    app.use('/api/v1/attendance', attendanceRoutes);

    // Dashboard Routes
    app.use('/api/v1/dashboard', dashboardRouter);

    return app.use("/", router);
}

export default initWebRoutes;