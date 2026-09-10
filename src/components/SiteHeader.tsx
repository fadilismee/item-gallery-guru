import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            MC
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-foreground sm:block">
            Micro<span className="text-primary">Computer</span>
          </span>
        </Link>
        <div className="flex-1" />
        <nav className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <Link
            to="/"
            className="rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-foreground"
          >
            Katalog
          </Link>
          <a
            href="#kontak"
            className="rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-foreground"
          >
            Kontak
          </a>
        </nav>
      </div>
    </header>
  );
}
