import { createContext } from "react";
import type { AdminUser } from "@/types/auth";

export type AdminAuthContextValue = {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
