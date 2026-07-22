import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import MatchResultCard from "@/components/MatchResultCard";
import { matches } from "@/data/league";

export const metadata: Metadata = {
  title: "Maç Sonuçları | Pozitif Lig",
  description: "Pozitif Lig Kuzey ve Güney Ligi maç sonuçları ve fikstür.",
};

export default function MacSonuclariPage() {
  const leagues = Array.from(new Set(matches.map((m) => m.league)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="2025/26 Sezonu"
        title="Maç Sonuçları"
        description="Oynanan maçların sonuçları. Canlı skor entegrasyonu için Sofascore API erişimi bağlandığında bu sayfa otomatik güncellenecek şekilde tasarlanmıştır."
      />
      <div className="flex flex-col gap-10">
        {leagues.map((league) => (
          <div key={league}>
            <h3 className="mb-4 text-lg font-bold text-accent">{league}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {matches
                .filter((m) => m.league === league)
                .map((m) => (
                  <MatchResultCard key={m.id} match={m} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
