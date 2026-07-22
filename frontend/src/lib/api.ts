import type {
  AbuseReport,
  AbuseReportListResponse,
  AbuseReportStatus,
  CreateAbuseReportInput,
  ListAbuseReportsParams,
} from "@/types/abuse";
import type { AdminUser, LoginInput } from "@/types/auth";
import type { CleanupResult, CleanupStats } from "@/types/cleanup";
import type { Domain, DomainInput, PublicDomain } from "@/types/domain";
import type {
  CreateMailboxInput,
  ListMailboxesParams,
  Mailbox,
  MailboxListResponse,
  RenewMailboxInput,
} from "@/types/mailbox";
import type { InboxMessage, MessageDetail } from "@/types/message";
import type { AppSettings, PublicSettings, UpdateSettingsInput } from "@/types/settings";

const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:9000";
const API_TIMEOUT_MS = 20000;

type ApiResponse<T> = {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
  errors?: unknown;
};

export class ApiRequestError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const headers = new Headers(init?.headers);

  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      signal: init?.signal ?? controller.signal,
      headers,
    });

    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

    if (!response.ok || !payload?.success) {
      throw new ApiRequestError(
        payload?.message ?? "Request failed",
        payload?.statusCode ?? response.status,
        payload?.errors,
      );
    }

    return payload.data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiRequestError("Request timed out", 408);
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function encodedAddress(address: string) {
  return encodeURIComponent(address);
}

function queryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const nextQuery = searchParams.toString();

  return nextQuery ? `?${nextQuery}` : "";
}

export function getPublicDomains() {
  return request<PublicDomain[]>("/api/domains/public");
}

export function getDomains() {
  return request<Domain[]>("/api/domains");
}

export function createDomain(input: DomainInput) {
  return request<Domain>("/api/domains", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDomain(id: number, input: DomainInput) {
  return request<Domain>(`/api/domains/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteDomain(id: number) {
  return request<null>(`/api/domains/${id}`, {
    method: "DELETE",
  });
}

export function createMailbox(input: CreateMailboxInput = {}) {
  return request<Mailbox>("/api/mailboxes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listMailboxes(params: ListMailboxesParams = {}) {
  return request<MailboxListResponse>(
    `/api/mailboxes${queryString({
      search: params.search,
      domainId: params.domainId,
      page: params.page,
      limit: params.limit,
    })}`,
  );
}

export function getMailbox(address: string) {
  return request<Mailbox>(`/api/mailboxes/${encodedAddress(address)}`);
}

export function renewMailbox(address: string, input: RenewMailboxInput = {}) {
  return request<Mailbox>(`/api/mailboxes/${encodedAddress(address)}/renew`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteMailbox(address: string) {
  return request<null>(`/api/mailboxes/${encodedAddress(address)}`, {
    method: "DELETE",
  });
}

export function getMailboxMessages(address: string) {
  return request<InboxMessage[]>(`/api/mailboxes/${encodedAddress(address)}/messages`);
}

export function getAdminMailboxMessages(address: string) {
  return request<InboxMessage[]>(`/api/mailboxes/${encodedAddress(address)}/admin/messages`);
}

export function getMessage(id: number, mailboxAddress: string) {
  return request<MessageDetail>(`/api/messages/${id}${queryString({ mailboxAddress })}`);
}

export function markMessageRead(id: number, mailboxAddress: string, isRead = true) {
  return request<MessageDetail>(`/api/messages/${id}/read${queryString({ mailboxAddress })}`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
  });
}

export function deleteMessage(id: number, mailboxAddress: string) {
  return request<null>(`/api/messages/${id}${queryString({ mailboxAddress })}`, {
    method: "DELETE",
  });
}

export function createAbuseReport(input: CreateAbuseReportInput) {
  return request<AbuseReport>("/api/abuse", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listAbuseReports(params: ListAbuseReportsParams = {}) {
  return request<AbuseReportListResponse>(
    `/api/abuse${queryString({
      search: params.search,
      page: params.page,
      limit: params.limit,
    })}`,
  );
}

export function getAbuseReport(id: number) {
  return request<AbuseReport>(`/api/abuse/${id}`);
}

export function updateAbuseReportStatus(id: number, status: AbuseReportStatus) {
  return request<AbuseReport>(`/api/abuse/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteAbuseReport(id: number) {
  return request<null>(`/api/abuse/${id}`, {
    method: "DELETE",
  });
}

export function loginAdmin(input: LoginInput) {
  return request<AdminUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logoutAdmin() {
  return request<null>("/api/auth/logout", {
    method: "POST",
  });
}

export function getAdminMe() {
  return request<AdminUser>("/api/auth/me");
}

export function getPublicSettings() {
  return request<PublicSettings>("/api/settings/public");
}

export function getSettings() {
  return request<AppSettings>("/api/settings");
}

export function updateSettings(input: UpdateSettingsInput) {
  return request<AppSettings>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getCleanupStats() {
  return request<CleanupStats>("/api/cleanup/stats");
}

export function runCleanup() {
  return request<CleanupResult>("/api/cleanup/run", {
    method: "POST",
  });
}
