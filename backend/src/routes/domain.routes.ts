import { Router } from "express";
import {
  getDomain,
  getDomains,
  getPublicDomains,
  patchDomain,
  postDomain,
  removeDomain
} from "../controllers/domain.controller";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.get("/public", getPublicDomains);
router.get("/", requireAdmin, getDomains);
router.get("/:id", requireAdmin, getDomain);
router.post("/", requireAdmin, postDomain);
router.patch("/:id", requireAdmin, patchDomain);
router.delete("/:id", requireAdmin, removeDomain);

export default router;
