import { Router } from "express";
import {
  getMessage,
  patchMessageRead,
  removeMessage
} from "../controllers/message.controller";
import { mutationLimiter } from "../middlewares/rate-limit";

const router = Router();

router.get("/:id", getMessage);
router.patch("/:id/read", patchMessageRead);
router.delete("/:id", mutationLimiter, removeMessage);

export default router;
