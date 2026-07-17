import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useCallback, useMemo } from "react";

import { getAdminMe, loginAdmin, logoutAdmin } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

import { AdminAuthContext } from "./admin-auth-context";

async function getAdminMeOrNull() {
  try {
    return await getAdminMe();
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const adminMeQuery = useQuery({
    queryKey: queryKeys.adminMe,
    queryFn: getAdminMeOrNull,
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (nextUser) => {
      queryClient.setQueryData(queryKeys.adminMe, nextUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSettled: () => {
      queryClient.setQueryData(queryKeys.adminMe, null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminRoot });
    },
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.adminMe });
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const user = adminMeQuery.data ?? null;

  const value = useMemo(
    () => ({
      user,
      isLoading: adminMeQuery.isPending,
      isAuthenticated: Boolean(user),
      isLoggingIn: loginMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      login,
      logout,
      refresh,
    }),
    [
      adminMeQuery.isPending,
      login,
      loginMutation.isPending,
      logout,
      logoutMutation.isPending,
      refresh,
      user,
    ],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
