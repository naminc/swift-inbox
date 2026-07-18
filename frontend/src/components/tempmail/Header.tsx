import { Mail, Menu, Moon, Shield, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAdminAuth } from "@/hooks/use-admin-auth-hook";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useTheme } from "@/hooks/use-theme";
import { SITE_DEFAULTS } from "@/lib/site-defaults";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/domains", label: "Domains" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
  { to: "/donate", label: "Donate" },
] as const;

export function Header() {
  const { theme, toggle } = useTheme();
  const { isAuthenticated } = useAdminAuth();
  const { data: publicSettings } = usePublicSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const siteName = publicSettings?.siteName || SITE_DEFAULTS.siteName;

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/admin/domains"
              className="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="ml-1 grid h-8 w-8 place-items-center rounded text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded text-muted-foreground hover:text-foreground"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-border px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/admin/domains"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
