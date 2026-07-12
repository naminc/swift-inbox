import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} TempMail</span>
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
