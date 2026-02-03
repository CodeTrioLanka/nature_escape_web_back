import express from "express";
import { getLogsController, cleanupLogsController, getLogStatsController } from "../controllers/log.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All log routes require authentication
router.use(authenticate);

// Get logs with filtering and pagination
router.get("/", getLogsController);

// Get log statistics
router.get("/stats", getLogStatsController);

// Cleanup old logs (admin only)
router.delete("/cleanup", cleanupLogsController);

export default router;
