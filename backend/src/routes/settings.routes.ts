import { Router } from "express";
import {
  getAppSettings,
  getPublicAppSettings,
  patchAppSettings
} from "../controllers/settings.controller";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.get("/public", getPublicAppSettings);
router.get("/", requireAdmin, getAppSettings);
router.patch("/", requireAdmin, patchAppSettings);

export default router;
