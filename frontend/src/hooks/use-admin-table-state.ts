import { useMemo, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

type UseAdminTableStateOptions = {
  limit: number;
  withDomainFilter?: boolean;
};

export function useAdminTableState({ limit, withDomainFilter = false }: UseAdminTableStateOptions) {
  const [search, setSearch] = useState("");
  const [domainId, setDomainId] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDomainChange = (value: string) => {
    setDomainId(value);
    setPage(1);
  };

  const handlePrev = () => setPage((current) => Math.max(1, current - 1));

  const handleNext = (totalPages: number) =>
    setPage((current) => Math.min(totalPages, current + 1));

  const params = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      ...(withDomainFilter && domainId ? { domainId: Number(domainId) } : {}),
      page,
      limit,
    }),
    [debouncedSearch, domainId, limit, page, withDomainFilter],
  );

  return {
    search,
    domainId,
    page,
    params,
    handleSearchChange,
    handleDomainChange,
    handlePrev,
    handleNext,
  };
}
