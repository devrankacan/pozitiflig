import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { teams } from "@/data/league";
import { slugify } from "@/lib/search";

export const metadata: Metadata = {
  title: "Takımlar | Pozitif Lig",
  description: "Pozitif Lig'de mücadele eden takımlar.",
};

export default function TakimlarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="Kuzey & Güney Ligi"
        title="Takımlar"
        description="Kadro detayları yakında eklenecek. Takımınızın logosunu ve kadro bilgilerini iletirseniz sayfayı sizin için güncelleyebiliriz."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {teams.map((team) => (
          <div
            key={team}
            id={slugify(team)}
            className="pl-card scroll-mt-24 flex flex-col items-center gap-3 p-6 text-center transition-colors hover:border-accent"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-lg font-extrabold text-accent">
              {team
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span className="font-semibold">{team}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
