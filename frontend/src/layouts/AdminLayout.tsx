import {
  AlertTriangle,
  Database,
  Home,
  LogOut,
  Mail,
  Settings,
  Shield,
  Wrench,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth-hook";
import { getSettings } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function AdminLayout() {
  const navigate = useNavigate();
  const { isLoggingOut, logout, user } = useAdminAuth();
  const settingsQuery = useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
  });

  const isMaintenanceMode = Boolean(settingsQuery.data?.maintenanceMode);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/admin/domains" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold leading-none">Swift Inbox Admin</div>
              <div className="mt-1 text-xs text-muted-foreground">Operations console</div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {isMaintenanceMode && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Maintenance
              </span>
            )}
            {user?.email && (
              <span className="hidden max-w-[220px] truncate text-xs text-muted-foreground sm:inline">
                {user.email}
              </span>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <Home className="h-4 w-4" />
                Public
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            <NavLink
              to="/admin/domains"
              className={({ isActive }) =>
                `inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <Database className="h-4 w-4" />
              Domains
            </NavLink>
            <NavLink
              to="/admin/mailboxes"
              className={({ isActive }) =>
                `inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <Mail className="h-4 w-4" />
              Mailboxes
            </NavLink>
            <NavLink
              to="/admin/abuse"
              className={({ isActive }) =>
                `inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <AlertTriangle className="h-4 w-4" />
              Abuse
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
            <NavLink
              to="/admin/operations"
              className={({ isActive }) =>
                `inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              <Wrench className="h-4 w-4" />
              Operations
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
