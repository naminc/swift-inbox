import { useQuery } from "@tanstack/react-query";

import { getPublicSettings } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function usePublicSettings() {
  return useQuery({
    queryKey: queryKeys.publicSettings,
    queryFn: getPublicSettings,
  });
}
