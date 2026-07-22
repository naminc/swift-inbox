import { Router } from "express";
import {
  getAdminMailboxMessages,
  getMailbox,
  getMailboxMessages,
  getMailboxes,
  patchMailboxRenew,
  postMailbox,
  removeAllMailboxes,
  removeMailbox
} from "../controllers/mailbox.controller";
import { attachOptionalAdmin } from "../middlewares/attach-optional-admin";
import {
  createMailboxLimiter,
  mutationLimiter
} from "../middlewares/rate-limit";
import { requireAdmin } from "../middlewares/require-admin";
import { validate } from "../middlewares/validate";
import { listMailboxesQuerySchema } from "../validators/mailbox.validators";

const router = Router();

router.get(
  "/",
  requireAdmin,
  validate(listMailboxesQuerySchema, "query"),
  getMailboxes
);
router.post("/", createMailboxLimiter, attachOptionalAdmin, postMailbox);
router.delete("/", requireAdmin, mutationLimiter, removeAllMailboxes);
router.get("/:address/admin/messages", requireAdmin, getAdminMailboxMessages);
router.get("/:address/messages", getMailboxMessages);
router.patch("/:address/renew", mutationLimiter, patchMailboxRenew);
router.get("/:address", getMailbox);
router.delete("/:address", mutationLimiter, removeMailbox);

export default router;
