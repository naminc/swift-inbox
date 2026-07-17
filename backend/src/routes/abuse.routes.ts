import { Router } from "express";
import {
  getAbuseReport,
  getAbuseReports,
  patchAbuseReportStatus,
  postAbuseReport,
  removeAbuseReport
} from "../controllers/abuse.controller";
import { abuseLimiter } from "../middlewares/rate-limit";
import { requireAdmin } from "../middlewares/require-admin";
import { validate } from "../middlewares/validate";
import { listAbuseReportsQuerySchema } from "../validators/abuse.validators";

const router = Router();

router.post("/", abuseLimiter, postAbuseReport);
router.get(
  "/",
  requireAdmin,
  validate(listAbuseReportsQuerySchema, "query"),
  getAbuseReports
);
router.get("/:id", requireAdmin, getAbuseReport);
router.patch("/:id", requireAdmin, patchAbuseReportStatus);
router.delete("/:id", requireAdmin, removeAbuseReport);

export default router;
