import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { createDomain, deleteDomain, getDomains, updateDomain } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { queryKeys } from "@/lib/query-keys";
import { validateDomainInput } from "@/lib/validation";
import type { Domain, DomainInput } from "@/types/domain";

export type DomainFormState = {
  name: string;
  label: string;
  isActive: boolean;
  isDefault: boolean;
};

export const emptyDomainForm: DomainFormState = {
  name: "",
  label: "",
  isActive: true,
  isDefault: false,
};

const EMPTY_DOMAINS: Domain[] = [];

function toForm(domain: Domain): DomainFormState {
  return {
    name: domain.name,
    label: domain.label ?? "",
    isActive: domain.isActive,
    isDefault: domain.isDefault,
  };
}

function toInput(form: DomainFormState): DomainInput {
  return {
    name: form.name.trim().toLowerCase(),
    label: form.label.trim() || null,
    isActive: form.isActive,
    isDefault: form.isDefault,
  };
}

export function useAdminDomains() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [form, setForm] = useState<DomainFormState>(emptyDomainForm);

  const domainsQuery = useQuery({
    queryKey: queryKeys.domains,
    queryFn: getDomains,
  });

  const refreshDomains = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.domains,
    });

  const createDomainMutation = useMutation({
    mutationFn: createDomain,
    onSuccess: () => {
      void refreshDomains();
    },
  });

  const updateDomainMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: DomainInput }) => updateDomain(id, input),
    onSuccess: () => {
      void refreshDomains();
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: deleteDomain,
    onSuccess: () => {
      void refreshDomains();
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminMailboxesRoot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cleanupStats });
    },
  });

  const domains = domainsQuery.data ?? EMPTY_DOMAINS;
  const pageError =
    error ??
    (domainsQuery.isError ? errorMessage(domainsQuery.error, "Could not load domains") : null);

  const stats = useMemo(() => {
    const active = domains.filter((domain) => domain.isActive).length;
    const defaultDomain = domains.find((domain) => domain.isDefault)?.name ?? "None";

    return {
      total: domains.length,
      active,
      defaultDomain,
    };
  }, [domains]);

  const openCreateDialog = () => {
    setEditingDomain(null);
    setForm(emptyDomainForm);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (domain: Domain) => {
    setEditingDomain(domain);
    setForm(toForm(domain));
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const input = toInput(form);
    const validationError = validateDomainInput(input);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    try {
      if (editingDomain) {
        await updateDomainMutation.mutateAsync({ id: editingDomain.id, input });
      } else {
        await createDomainMutation.mutateAsync(input);
      }

      setIsDialogOpen(false);
    } catch (nextError) {
      setFormError(errorMessage(nextError, "Could not save domain"));
    }
  };

  const handleDelete = async (domain: Domain) => {
    const confirmed = window.confirm(
      `Delete ${domain.name}? This will only work if no mailboxes are using this domain.`,
    );

    if (!confirmed) return;

    setError(null);

    try {
      await deleteDomainMutation.mutateAsync(domain.id);
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not delete domain"));
    }
  };

  return {
    domains,
    isLoading: domainsQuery.isPending,
    isFetching: domainsQuery.isFetching,
    refetch: domainsQuery.refetch,
    isSubmitting: createDomainMutation.isPending || updateDomainMutation.isPending,
    isDeleting: deleteDomainMutation.isPending,
    pageError,
    stats,
    form,
    setForm,
    formError,
    isDialogOpen,
    setIsDialogOpen,
    isEditing: Boolean(editingDomain),
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    handleDelete,
  };
}
