const CURRENT_MAILBOX_KEY = "swift_inbox_current_mailbox";

export type StoredMailbox = {
  address: string;
};

function getStorage() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredMailbox(): StoredMailbox | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(CURRENT_MAILBOX_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredMailbox>;

    if (!parsed.address || typeof parsed.address !== "string") {
      return null;
    }

    return { address: parsed.address };
  } catch {
    return null;
  }
}

export function setStoredMailbox(mailbox: StoredMailbox) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(CURRENT_MAILBOX_KEY, JSON.stringify(mailbox));
  } catch {
    // Storage can be unavailable in private browsing or locked-down contexts.
  }
}

export function clearStoredMailbox() {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(CURRENT_MAILBOX_KEY);
  } catch {
    // Ignore storage cleanup failures; backend remains the source of truth.
  }
}
