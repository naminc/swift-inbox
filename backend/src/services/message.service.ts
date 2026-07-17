import prisma from "../configs/prisma";
import { assertMailboxReadable } from "./mailbox.service";
import { assertMaintenanceModeDisabled } from "./settings.service";
import { ApiError } from "../utils/api-error";

const messageDetailSelect = {
  id: true,
  fromAddress: true,
  subject: true,
  textBody: true,
  htmlBody: true,
  isRead: true,
  receivedAt: true,
  mailbox: {
    select: {
      id: true,
      address: true,
      expiresAt: true,
      domain: {
        select: {
          id: true,
          name: true
        }
      }
    }
  }
} as const;

export async function getMessageById(id: number, mailboxAddress: string) {
  const message = await prisma.message.findFirst({
    where: {
      id,
      mailbox: {
        address: mailboxAddress
      }
    },
    select: messageDetailSelect
  });

  if (!message) {
    throw ApiError.notFound("Message not found");
  }

  assertMailboxReadable(message.mailbox);

  return message;
}

export async function updateMessageReadState(
  id: number,
  mailboxAddress: string,
  isRead = true
) {
  await assertMaintenanceModeDisabled();
  await getMessageById(id, mailboxAddress);

  return prisma.message.update({
    where: { id },
    data: { isRead },
    select: messageDetailSelect
  });
}

export async function deleteMessage(id: number, mailboxAddress: string) {
  await assertMaintenanceModeDisabled();
  await getMessageById(id, mailboxAddress);

  await prisma.message.delete({
    where: { id }
  });
}
