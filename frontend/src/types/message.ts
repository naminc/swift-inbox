export type InboxMessage = {
  id: number;
  fromAddress: string;
  subject: string | null;
  textBody: string | null;
  htmlBody?: string | null;
  isRead: boolean;
  receivedAt: string;
};

export type MessageDetail = InboxMessage & {
  htmlBody?: string | null;
  mailbox?: {
    id: number;
    address: string;
    domain: {
      id: number;
      name: string;
    };
  };
};

export type EmailListItem = {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
};
