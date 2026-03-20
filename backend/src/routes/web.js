import express, { Router } from "express";
import homeController from "../controllers/homeController.js";
import authRoutes from './authRoutes.js';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage);

    app.use('/api/v1/auth', authRoutes);

    return app.use("/", router);
}

export default initWebRoutes;