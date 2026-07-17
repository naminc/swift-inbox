import { Router } from "express";
import {
  getCleanupStatsController,
  runCleanupController
} from "../controllers/cleanup.controller";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.get("/stats", requireAdmin, getCleanupStatsController);
router.post("/run", requireAdmin, runCleanupController);

export default router;
