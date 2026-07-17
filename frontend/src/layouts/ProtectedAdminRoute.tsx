import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAdminAuth } from "@/hooks/use-admin-auth-hook";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-sm text-muted-foreground">
        Loading admin session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
