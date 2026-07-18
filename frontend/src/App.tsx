import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";

import { AppReadyMarker } from "@/components/feedback/AppReadyMarker";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { PublicSettingsMeta } from "@/components/feedback/PublicSettingsMeta";
import { RouteProgress } from "@/components/feedback/RouteProgress";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { queryClient } from "@/lib/query-client";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <PublicSettingsMeta />
          <RouteProgress />
          <Suspense fallback={null}>
            <AppReadyMarker />
            <AppRoutes />
          </Suspense>
        </AdminAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
