import { teams, matches, golKrallari, asistKrallari } from "@/data/league";

export type SearchResultType = "sayfa" | "takım" | "maç" | "oyuncu";

export type SearchResult = {
  type: SearchResultType;
  label: string;
  sublabel?: string;
  href: string;
};

export function slugify(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const PAGES: SearchResult[] = [
  { type: "sayfa", label: "Ana Sayfa", href: "/" },
  { type: "sayfa", label: "Puan Durumu", href: "/puan-durumu" },
  { type: "sayfa", label: "Maç Sonuçları", href: "/mac-sonuclari" },
  { type: "sayfa", label: "Takımlar", href: "/takimlar" },
  { type: "sayfa", label: "Hakkında", href: "/hakkinda" },
];

function buildIndex(): SearchResult[] {
  const teamResults: SearchResult[] = teams.map((team) => ({
    type: "takım",
    label: team,
    href: `/takimlar#${slugify(team)}`,
  }));

  const matchResults: SearchResult[] = matches.map((m) => ({
    type: "maç",
    label: `${m.home} - ${m.away}`,
    sublabel: `${m.league} · ${m.round}`,
    href: `/mac-sonuclari#${m.id}`,
  }));

  const playerResults: SearchResult[] = [
    ...golKrallari.map((p) => ({
      type: "oyuncu" as const,
      label: p.name,
      sublabel: `${p.value} gol · Gol Krallığı`,
      href: "/#gol-krallik",
    })),
    ...asistKrallari.map((p) => ({
      type: "oyuncu" as const,
      label: p.name,
      sublabel: `${p.value} asist · Asist Krallığı`,
      href: "/#asist-krallik",
    })),
  ];

  return [...PAGES, ...teamResults, ...matchResults, ...playerResults];
}

const INDEX = buildIndex();

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR");
}

export function search(query: string, limit = 8): SearchResult[] {
  const q = normalize(query.trim());
  if (!q) return [];

  return INDEX.filter(
    (item) => normalize(item.label).includes(q) || (item.sublabel && normalize(item.sublabel).includes(q)),
  ).slice(0, limit);
}
