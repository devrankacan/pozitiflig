"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBox from "@/components/SearchBox";

const NAV_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/puan-durumu", label: "Puan Durumu" },
  { href: "/mac-sonuclari", label: "Maç Sonuçları" },
  { href: "/takimlar", label: "Takımlar" },
  { href: "/hakkinda", label: "Hakkında" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => {
            setOpen(false);
            setSearchOpen(false);
          }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-background">
            PL
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight sm:inline">
            Pozitif<span className="pl-gradient-text">Lig</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface-2 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden max-w-xs flex-1 md:block">
          <SearchBox />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center justify-center rounded-full border border-border p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground md:hidden"
            aria-label="Arama"
            onClick={() => {
              setSearchOpen((v) => !v);
              setOpen(false);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>

          <ThemeToggle />

          <button
            type="button"
            className="flex items-center justify-center rounded-lg border border-border p-2 lg:hidden"
            aria-label="Menüyü aç/kapat"
            onClick={() => {
              setOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <SearchBox />
        </div>
      )}

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 lg:hidden">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-surface-2 text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
