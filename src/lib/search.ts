import { teams, golKrallari, asistKrallari } from "@/data/league";

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
  { type: "sayfa", label: "Maçlar", href: "/maclar" },
  { type: "sayfa", label: "Takımlar", href: "/takimlar" },
  { type: "sayfa", label: "Hakkında", href: "/hakkinda" },
];

function buildIndex(): SearchResult[] {
  // Not: Takımlar sayfası artık canlı API'den gelen (bazen farklı/tam)
  // isimlerle render edildiği için, burada statik isimlerden üretilen
  // çapa (#slug) yerine sayfanın kendisine yönlendiriyoruz.
  const teamResults: SearchResult[] = teams.map((team) => ({
    type: "takım",
    label: team,
    href: "/takimlar",
  }));

  // Not: Maçlar artık canlı API'den geldiği için (dinamik id'ler), maç
  // sonuçları arama dizinine dahil edilmiyor - "Maç Sonuçları" sayfa
  // bağlantısı üzerinden erişilebilir.

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

  return [...PAGES, ...teamResults, ...playerResults];
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
