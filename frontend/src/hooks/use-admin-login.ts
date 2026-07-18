import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAdminAuth } from "@/hooks/use-admin-auth-hook";
import { errorMessage } from "@/lib/errors";

type LocationState = {
  from?: string;
};

const DEFAULT_REDIRECT = "/admin/domains";

export function useAdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, isLoggingIn, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email.trim(), password);
      const state = location.state as LocationState | null;
      navigate(state?.from ?? DEFAULT_REDIRECT, { replace: true });
    } catch (nextError) {
      setError(errorMessage(nextError, "Could not log in"));
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isAuthenticated,
    isLoading,
    isLoggingIn,
    handleSubmit,
    redirectTo: DEFAULT_REDIRECT,
  };
}
