export type Mailbox = {
  id: number;
  address: string;
  localPart: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt?: string;
  domain: {
    id: number;
    name: string;
  };
};

export type CreateMailboxInput = {
  localPart?: string;
  domainId?: number;
  expiresInMinutes?: number;
};

export type RenewMailboxInput = {
  expiresInMinutes?: number;
};

export type DeleteAllMailboxesInput = {
  confirmation: "DELETE_ALL_MAILBOXES";
};

export type DeleteAllMailboxesResult = {
  deletedMailboxes: number;
  deletedMessages: number;
  ranAt: string;
};

export type MailboxListItem = Mailbox & {
  updatedAt: string;
  _count: {
    messages: number;
  };
};

export type MailboxListResponse = {
  items: MailboxListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ListMailboxesParams = {
  search?: string;
  domainId?: number;
  page?: number;
  limit?: number;
};
