import { Request, Response } from "express";
import { STATUS_CODES } from "../constants/status-codes";
import {
  createMailbox,
  deleteMailbox,
  getMailboxByAddress,
  listMailboxes,
  listMailboxMessages,
  renewMailbox
} from "../services/mailbox.service";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";
import { getStringParam } from "../utils/params";
import {
  addressSchema,
  createMailboxSchema,
  renewMailboxSchema
} from "../validators/mailbox.validators";

function getAddressParam(req: Request) {
  const value = getStringParam(req, "address", "Invalid mailbox address");

  const result = addressSchema.safeParse(value);

  if (!result.success) {
    throw ApiError.badRequest(
      "Invalid mailbox address",
      result.error.flatten()
    );
  }

  return result.data;
}

export const postMailbox = AsyncHandler(async (req: Request, res: Response) => {
  const result = createMailboxSchema.safeParse(req.body);

  if (!result.success) {
    throw ApiError.validation(
      "Invalid mailbox payload",
      result.error.flatten()
    );
  }

  const mailbox = await createMailbox(result.data);

  return ApiResponse.created(res, "Mailbox created", mailbox);
});

export const getMailboxes = AsyncHandler(
  async (req: Request, res: Response) => {
    const mailboxes = await listMailboxes(req.query as never);

    return ApiResponse.ok(res, "Mailboxes fetched", mailboxes);
  }
);

export const getMailbox = AsyncHandler(async (req: Request, res: Response) => {
  const mailbox = await getMailboxByAddress(getAddressParam(req));

  return ApiResponse.ok(res, "Mailbox fetched", mailbox);
});

export const patchMailboxRenew = AsyncHandler(
  async (req: Request, res: Response) => {
    const result = renewMailboxSchema.safeParse(req.body ?? {});

    if (!result.success) {
      throw ApiError.validation(
        "Invalid renew mailbox payload",
        result.error.flatten()
      );
    }

    const mailbox = await renewMailbox(getAddressParam(req), result.data);

    return ApiResponse.ok(res, "Mailbox renewed", mailbox);
  }
);

export const removeMailbox = AsyncHandler(
  async (req: Request, res: Response) => {
    await deleteMailbox(getAddressParam(req));

    return ApiResponse.Success(res, "Mailbox deleted", null, STATUS_CODES.OK);
  }
);

export const getMailboxMessages = AsyncHandler(
  async (req: Request, res: Response) => {
    const messages = await listMailboxMessages(getAddressParam(req));

    return ApiResponse.ok(res, "Mailbox messages fetched", messages);
  }
);
