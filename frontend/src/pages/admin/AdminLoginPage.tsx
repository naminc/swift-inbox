import { Navigate } from "react-router-dom";
import { Shield } from "lucide-react";

import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminLogin } from "@/hooks/use-admin-login";
import { usePageTitle } from "@/hooks/use-page-title";

export function AdminLoginPage() {
  usePageTitle("Admin Login - Swift Inbox");

  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isAuthenticated,
    isLoading,
    isLoggingIn,
    handleSubmit,
    redirectTo,
  } = useAdminLogin();

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-md border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold leading-none">Admin Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Swift Inbox operations console</p>
          </div>
        </div>

        {error && (
          <StatusMessage tone="error" className="mt-4 px-3 py-2">
            {error}
          </StatusMessage>
        )}

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="admin-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              className="mt-2"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="mt-2"
              required
            />
          </div>
        </div>

        <Button type="submit" className="mt-5 w-full" disabled={isLoading || isLoggingIn}>
          {isLoggingIn ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
