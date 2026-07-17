import { formatRelativeTime } from "@/lib/date";
import type { EmailListItem, InboxMessage } from "@/types/message";

type ReadableMessage = {
  textBody?: string | null;
  htmlBody?: string | null;
};

export function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readableMessageBody(message: ReadableMessage) {
  return message.textBody?.trim() || (message.htmlBody ? stripHtml(message.htmlBody) : "");
}

export function previewText(value: string, maxLength = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) return "No readable body.";

  return normalized.length > maxLength
    ? `${normalized.slice(0, Math.max(0, maxLength - 3))}...`
    : normalized;
}

export function senderName(address: string) {
  const [localPart] = address.split("@");
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();

  if (!cleaned) return address;

  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function mapInboxMessage(message: InboxMessage): EmailListItem {
  const body = readableMessageBody(message);

  return {
    id: String(message.id),
    from: senderName(message.fromAddress),
    fromEmail: message.fromAddress,
    subject: message.subject ?? "(No subject)",
    preview: previewText(body),
    body: body || "No readable body.",
    time: formatRelativeTime(message.receivedAt),
    unread: !message.isRead,
  };
}
