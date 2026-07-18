import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ApiRequestError,
  createMailbox,
  getMailbox,
  getPublicDomains,
  getPublicSettings,
  renewMailbox,
  deleteMailbox as deleteMailboxApi,
} from "@/lib/api";
import { getTimeRemaining } from "@/lib/date";
import { errorMessage } from "@/lib/errors";
import {
  formatMailboxAddress,
  normalizeLocalPart,
  parseMailboxAddress,
  randomLocalPart,
} from "@/lib/mailbox-address";
import { clearStoredMailbox, getStoredMailbox, setStoredMailbox } from "@/lib/mailbox-storage";
import { queryKeys } from "@/lib/query-keys";
import type { PublicDomain } from "@/types/domain";
import type { Mailbox } from "@/types/mailbox";

const EMPTY_DOMAINS: PublicDomain[] = [];
const MAINTENANCE_MESSAGE =
  "Swift Inbox is under maintenance. Existing inboxes can be viewed, but new addresses and mailbox changes are paused.";

function hasMailboxExpired(mailbox: Mailbox) {
  return Boolean(mailbox.expiresAt && new Date(mailbox.expiresAt).getTime() <= Date.now());
}

function initialAddressParts() {
  const stored = getStoredMailbox();
  return stored ? parseMailboxAddress(stored.address) : null;
}

export function useCurrentMailbox() {
  const queryClient = useQueryClient();
  const hasBootstrapped = useRef(false);
  const initialStored = useRef(initialAddressParts());

  const [username, setUsername] = useState(
    () => initialStored.current?.localPart ?? randomLocalPart(),
  );
  const [domain, setDomain] = useState(() => initialStored.current?.domain ?? "");
  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePending, setIsCreatePending] = useState(false);
  const [isRandomPending, setIsRandomPending] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const domainsQuery = useQuery({ queryKey: queryKeys.publicDomains, queryFn: getPublicDomains });
  const publicSettingsQuery = useQuery({
    queryKey: queryKeys.publicSettings,
    queryFn: getPublicSettings,
  });

  const createMailboxMutation = useMutation({
    mutationFn: createMailbox,
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.mailbox(next.address), next);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cleanupStats });
    },
  });

  const getMailboxMutation = useMutation({
    mutationFn: getMailbox,
    onSuccess: (next) => {
      queryClient.setQueryData(queryKeys.mailbox(next.address), next);
    },
  });

  const renewMailboxMutation = useMutation({
    mutationFn: (address: string) => renewMailbox(address),
  });

  const deleteMailboxMutation = useMutation({
    mutationFn: deleteMailboxApi,
    onSuccess: (_data, address) => {
      queryClient.removeQueries({ queryKey: queryKeys.mailbox(address) });
      queryClient.removeQueries({ queryKey: queryKeys.mailboxMessages(address) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cleanupStats });
    },
  });

  const domains = domainsQuery.data ?? EMPTY_DOMAINS;
  const mailboxAddress = mailbox?.address ?? "";
  const isMaintenanceMode = Boolean(publicSettingsQuery.data?.maintenanceMode);
  const maintenanceMessage =
    publicSettingsQuery.data?.maintenanceMessage?.trim() || MAINTENANCE_MESSAGE;

  const randomLocalPartOptions = useMemo(
    () => ({
      minLength: publicSettingsQuery.data?.randomLocalPartMinLength,
      maxLength: publicSettingsQuery.data?.randomLocalPartMaxLength,
    }),
    [
      publicSettingsQuery.data?.randomLocalPartMaxLength,
      publicSettingsQuery.data?.randomLocalPartMinLength,
    ],
  );

  const timeRemaining = useMemo(
    () => getTimeRemaining(mailbox?.expiresAt ?? null, nowMs),
    [mailbox?.expiresAt, nowMs],
  );
  const isMailboxExpired = Boolean(timeRemaining?.isExpired);
  const expiryLabel = timeRemaining
    ? timeRemaining.isExpired
      ? "Expired"
      : `Expires in ${timeRemaining.label}`
    : null;
  const expiryTone = timeRemaining?.isExpired
    ? ("expired" as const)
    : timeRemaining && timeRemaining.ms <= 5 * 60 * 1000
      ? ("warning" as const)
      : ("active" as const);

  const selectedDomain = useMemo(() => domains.find((d) => d.name === domain), [domain, domains]);

  const domainOptions = useMemo(
    () => domains.map((d) => ({ id: d.id, value: d.name, label: d.label })),
    [domains],
  );

  const email = formatMailboxAddress(username, domain);
  const isDomainsLoading = domainsQuery.isPending;
  const isBusy =
    isDomainsLoading ||
    isCreatePending ||
    isRandomPending ||
    isDeletePending ||
    renewMailboxMutation.isPending ||
    deleteMailboxMutation.isPending;

  const clearMailboxView = useCallback(() => {
    setMailbox(null);
  }, []);

  const createRandomLocalPart = useCallback(
    () => randomLocalPart(randomLocalPartOptions),
    [randomLocalPartOptions],
  );

  const activateMailbox = useCallback(
    (next: Mailbox) => {
      queryClient.setQueryData(queryKeys.mailbox(next.address), next);
      setMailbox(next);
      setUsername(next.localPart);
      setDomain(next.domain.name);
      setStoredMailbox({ address: next.address });
    },
    [queryClient],
  );

  const createOrLoadMailbox = useCallback(
    async (localPart: string | undefined, targetDomain: PublicDomain | undefined) => {
      if (!targetDomain) {
        setError("No active domains are available");
        return;
      }
      const normalized = localPart ? normalizeLocalPart(localPart) : undefined;
      setError(null);
      try {
        const next = await createMailboxMutation.mutateAsync({
          ...(normalized && { localPart: normalized }),
          domainId: targetDomain.id,
        });
        activateMailbox(next);
      } catch (err) {
        if (err instanceof ApiRequestError && err.statusCode === 409 && normalized) {
          try {
            const existing = await getMailboxMutation.mutateAsync(
              `${normalized}@${targetDomain.name}`,
            );
            if (hasMailboxExpired(existing)) {
              activateMailbox(existing);
              setError("This mailbox has expired. Renew it to continue receiving mail.");
              return;
            }
            activateMailbox(existing);
            return;
          } catch (fallback) {
            setError(errorMessage(fallback, "Could not load existing mailbox"));
            return;
          }
        }
        setError(errorMessage(err, "Could not create mailbox"));
      }
    },
    [activateMailbox, createMailboxMutation, getMailboxMutation],
  );

  const getRandomTargetDomain = useCallback(
    () => selectedDomain ?? domains.find((d) => d.isDefault) ?? domains[0],
    [domains, selectedDomain],
  );

  const createRandomMailbox = useCallback(async () => {
    const target = getRandomTargetDomain();
    if (!target) throw new Error("No active domains are available");
    setError(null);
    const next = await createMailboxMutation.mutateAsync({ domainId: target.id });
    activateMailbox(next);
    return next;
  }, [activateMailbox, createMailboxMutation, getRandomTargetDomain]);

  // Error-sync effects
  useEffect(() => {
    if (domainsQuery.isError) setError(errorMessage(domainsQuery.error, "Could not load domains"));
  }, [domainsQuery.error, domainsQuery.isError]);

  useEffect(() => {
    if (publicSettingsQuery.isError)
      setError(errorMessage(publicSettingsQuery.error, "Could not load public settings"));
  }, [publicSettingsQuery.error, publicSettingsQuery.isError]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Bootstrap
  useEffect(() => {
    if (
      hasBootstrapped.current ||
      domainsQuery.isPending ||
      domainsQuery.isError ||
      publicSettingsQuery.isPending
    )
      return;

    const defaultDomain = domains.find((d) => d.isDefault) ?? domains[0];
    if (!defaultDomain) {
      setError("No active domains are available");
      hasBootstrapped.current = true;
      return;
    }
    hasBootstrapped.current = true;
    setDomain((cur) => cur || defaultDomain.name);

    const bootstrap = async () => {
      const stored = getStoredMailbox();
      if (stored) {
        try {
          const existing = await getMailboxMutation.mutateAsync(stored.address);
          activateMailbox(existing);
          return;
        } catch (err) {
          if (err instanceof ApiRequestError && err.statusCode === 404) {
            clearStoredMailbox();
            if (isMaintenanceMode) {
              setUsername(createRandomLocalPart());
              return;
            }
            await createOrLoadMailbox(createRandomLocalPart(), defaultDomain);
            return;
          }
          setError(errorMessage(err, "Could not restore saved mailbox"));
          return;
        }
      }
      const nextLocal = createRandomLocalPart();
      setUsername(nextLocal);
      if (isMaintenanceMode) return;
      await createOrLoadMailbox(nextLocal, defaultDomain);
    };

    void bootstrap();
  }, [
    activateMailbox,
    createOrLoadMailbox,
    createRandomLocalPart,
    domains,
    domainsQuery.isError,
    domainsQuery.isPending,
    getMailboxMutation,
    isMaintenanceMode,
    publicSettingsQuery.isPending,
  ]);

  // Action handlers
  const handleUsernameChange = useCallback(
    (value: string) => {
      setUsername(normalizeLocalPart(value));
      clearMailboxView();
    },
    [clearMailboxView],
  );

  const handleDomainChange = useCallback(
    (value: string) => {
      setDomain(value);
      clearMailboxView();
    },
    [clearMailboxView],
  );

  const handleCreate = useCallback(() => {
    if (isCreatePending || isMaintenanceMode) return;
    setIsCreatePending(true);
    void createOrLoadMailbox(username || createRandomLocalPart(), selectedDomain).finally(() =>
      setIsCreatePending(false),
    );
  }, [
    createOrLoadMailbox,
    createRandomLocalPart,
    isCreatePending,
    isMaintenanceMode,
    selectedDomain,
    username,
  ]);

  const handleRandom = useCallback(() => {
    if (isRandomPending || isMaintenanceMode) return;
    setIsRandomPending(true);
    void createRandomMailbox()
      .catch((err) => setError(errorMessage(err, "Could not create mailbox")))
      .finally(() => setIsRandomPending(false));
  }, [createRandomMailbox, isMaintenanceMode, isRandomPending]);

  const handleDelete = useCallback(async () => {
    if (isMaintenanceMode) return;
    if (!window.confirm("Delete this email address and all messages?")) return;
    setError(null);
    setIsDeletePending(true);

    if (!mailbox) {
      clearStoredMailbox();
      clearMailboxView();
      try {
        await createRandomMailbox();
      } catch (err) {
        setError(errorMessage(err, "Could not create mailbox"));
      } finally {
        setIsDeletePending(false);
      }
      return;
    }

    const addr = mailbox.address;
    try {
      await deleteMailboxMutation.mutateAsync(addr);
      clearStoredMailbox();
      clearMailboxView();
    } catch (err) {
      setError(errorMessage(err, "Could not delete mailbox"));
      setIsDeletePending(false);
      return;
    }

    try {
      await createRandomMailbox();
    } catch (err) {
      clearStoredMailbox();
      clearMailboxView();
      setError(errorMessage(err, "Mailbox deleted, but could not create a new address"));
    } finally {
      setIsDeletePending(false);
    }
  }, [clearMailboxView, createRandomMailbox, deleteMailboxMutation, isMaintenanceMode, mailbox]);

  const handleRenew = useCallback(async () => {
    if (!mailbox || renewMailboxMutation.isPending || isMaintenanceMode) return;
    setError(null);
    try {
      const next = await renewMailboxMutation.mutateAsync(mailbox.address);
      activateMailbox(next);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cleanupStats });
    } catch (err) {
      if (err instanceof ApiRequestError && err.statusCode === 404) {
        clearStoredMailbox();
        clearMailboxView();
      }
      setError(errorMessage(err, "Could not renew mailbox"));
    }
  }, [
    activateMailbox,
    clearMailboxView,
    isMaintenanceMode,
    mailbox,
    queryClient,
    renewMailboxMutation,
  ]);

  return {
    mailbox,
    mailboxAddress,
    username,
    domain,
    email,
    error,
    setError,
    domainOptions,
    isDomainsLoading,
    isMaintenanceMode,
    maintenanceMessage,
    isMailboxExpired,
    expiryLabel,
    expiryTone,
    isBusy,
    isCreatePending,
    isRenewing: renewMailboxMutation.isPending,
    createRandomMailbox,
    handleUsernameChange,
    handleDomainChange,
    handleCreate,
    handleRandom,
    handleDelete,
    handleRenew,
  };
}
