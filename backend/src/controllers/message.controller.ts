import { Request, Response } from "express";
import {
  deleteMessage,
  getMessageById,
  updateMessageReadState
} from "../services/message.service";
import { STATUS_CODES } from "../constants/status-codes";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { AsyncHandler } from "../utils/async-handler";
import { getPositiveIntParam } from "../utils/params";
import {
  mailboxAddressQuerySchema,
  updateReadSchema
} from "../validators/message.validators";

const getIdParam = (req: Request) =>
  getPositiveIntParam(req, "id", "Invalid message id");

function getMailboxAddressQuery(req: Request) {
  const result = mailboxAddressQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw ApiError.badRequest(
      "Mailbox address is required",
      result.error.flatten()
    );
  }

  return result.data.mailboxAddress;
}

export const getMessage = AsyncHandler(async (req: Request, res: Response) => {
  const message = await getMessageById(
    getIdParam(req),
    getMailboxAddressQuery(req)
  );

  return ApiResponse.ok(res, "Message fetched", message);
});

export const patchMessageRead = AsyncHandler(
  async (req: Request, res: Response) => {
    const result = updateReadSchema.safeParse(req.body ?? {});

    if (!result.success) {
      throw ApiError.validation(
        "Invalid message payload",
        result.error.flatten()
      );
    }

    const message = await updateMessageReadState(
      getIdParam(req),
      getMailboxAddressQuery(req),
      result.data.isRead ?? true
    );

    return ApiResponse.ok(res, "Message read state updated", message);
  }
);

export const removeMessage = AsyncHandler(
  async (req: Request, res: Response) => {
    await deleteMessage(getIdParam(req), getMailboxAddressQuery(req));

    return ApiResponse.Success(res, "Message deleted", null, STATUS_CODES.OK);
  }
);
