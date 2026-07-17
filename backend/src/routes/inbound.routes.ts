import { Router } from "express";
import { postCloudflareInboundEmail } from "../controllers/inbound.controller";
import { inboundLimiter } from "../middlewares/rate-limit";

const router = Router();

router.post("/cloudflare", inboundLimiter, postCloudflareInboundEmail);

export default router;
