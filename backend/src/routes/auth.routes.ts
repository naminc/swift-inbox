import { Router } from "express";
import {
  getAdminMe,
  loginAdmin,
  logoutAdmin
} from "../controllers/auth.controller";
import { loginLimiter } from "../middlewares/rate-limit";
import { requireAdmin } from "../middlewares/require-admin";

const router = Router();

router.post("/login", loginLimiter, loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/me", requireAdmin, getAdminMe);

export default router;
