import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import StandingsWidget from "@/components/StandingsWidget";
import { standingsWidgets } from "@/data/league";

export const metadata: Metadata = {
  title: "Puan Durumu | Pozitif Lig",
  description: "Pozitif Lig Kuzey ve Güney Ligi güncel puan durumu.",
};

export default function PuanDurumuPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="2025/26 Sezonu"
        title="Puan Durumu"
        description="Puan durumları Sofascore üzerinden anlık olarak güncellenir."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {standingsWidgets.map((w) => (
          <StandingsWidget key={w.id} {...w} />
        ))}
      </div>
    </div>
  );
}
