import { Mail, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">TempMail</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
          <Link
            to="/"
            className="rounded px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/domains"
            className="rounded px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
          >
            Domains
          </Link>
          <Link
            to="/faq"
            className="rounded px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
          >
            FAQ
          </Link>
          <Link
            to="/terms"
            className="rounded px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            to="/donate"
            className="rounded px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
          >
            Donate
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-1 grid h-8 w-8 place-items-center rounded text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
