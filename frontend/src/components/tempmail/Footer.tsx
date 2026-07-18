import { Link } from "react-router-dom";

import { usePublicSettings } from "@/hooks/use-public-settings";
import { SITE_DEFAULTS } from "@/lib/site-defaults";

export function Footer() {
  const { data: publicSettings } = usePublicSettings();

  const siteName = publicSettings?.siteName || SITE_DEFAULTS.siteName;
  const metaAuthor = publicSettings?.metaAuthor ?? SITE_DEFAULTS.metaAuthor;

  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            &copy; {new Date().getFullYear()} {siteName}
          </span>
          {metaAuthor && (
            <>
              <span aria-hidden="true" className="text-rose-500">
                &hearts;
              </span>
              <span>Developed by {metaAuthor}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link to="/domains" className="hover:text-foreground">
            Domains
          </Link>
        </div>
      </div>
    </footer>
  );
}
