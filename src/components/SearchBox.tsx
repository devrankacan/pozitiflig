"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { search, type SearchResult, type SearchResultType } from "@/lib/search";

const TYPE_LABELS: Record<SearchResultType, string> = {
  sayfa: "Sayfalar",
  takım: "Takımlar",
  maç: "Maçlar",
  oyuncu: "Oyuncular",
};

const TYPE_ORDER: SearchResultType[] = ["sayfa", "takım", "maç", "oyuncu"];

function groupResults(results: SearchResult[]) {
  return TYPE_ORDER.map((type) => ({
    type,
    items: results.filter((r) => r.type === type),
  })).filter((group) => group.items.length > 0);
}

export default function SearchBox({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = search(query, 8);
  const groups = groupResults(results);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function updateQuery(value: string) {
    setQuery(value);
    setActiveIndex(0);
    setOpen(true);
  }

  function go(result: SearchResult) {
    router.push(result.href);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) go(target);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  let flatIndex = -1;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Takım, oyuncu veya maç ara..."
          className="w-full rounded-full border border-border bg-surface-2 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-full min-w-[280px] overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-xl sm:w-80">
          {groups.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted">Sonuç bulunamadı.</p>
          ) : (
            groups.map((group) => (
              <div key={group.type} className="mb-1 last:mb-0">
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  {TYPE_LABELS[group.type]}
                </p>
                {group.items.map((item) => {
                  flatIndex += 1;
                  const isActive = flatIndex === activeIndex;
                  return (
                    <Link
                      key={`${item.type}-${item.label}-${item.href}`}
                      href={item.href}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      className={`flex flex-col rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-surface-2 text-accent" : "text-foreground hover:bg-surface-2"
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      {item.sublabel && <span className="text-xs text-muted">{item.sublabel}</span>}
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
