import { Router } from "express";
import {
  healthCheck,
  detailedHealthCheck
} from "../controllers/health.controller";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.get("/", healthCheck);
router.get("/detailed", requireAdmin, detailedHealthCheck);

export default router;
