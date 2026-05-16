import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller.js";

const router = Router();

router.get("/metrics", DashboardController.getMetrics);

export default router;
