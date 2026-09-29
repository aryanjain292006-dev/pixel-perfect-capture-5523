import { Link } from "@tanstack/react-router";
import { Hexagon, Menu, X } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { to: "/", label: "Consumer Portal" },
  { to: "/admin", label: "KVIC Admin" },
  { to: "/beekeeper", label: "Beekeeper Hub" },
  { to: "/store", label: "Store Owner" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-honey shadow-soft transition-transform group-hover:scale-105">
            <Hexagon className="size-5 text-primary-foreground" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">Honey Chain</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              SIH 26021 · KVIC
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-honey-soft text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-lg border border-border transition-colors hover:bg-secondary md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" }}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
              activeProps={{ className: "bg-honey-soft text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
