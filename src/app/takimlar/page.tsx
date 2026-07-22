import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import TeamLogo from "@/components/TeamLogo";
import { slugify } from "@/lib/search";
import { getLiveTeams } from "@/lib/league-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Takımlar | Pozitif Lig",
  description: "Pozitif Lig'de mücadele eden takımlar.",
};

export default async function TakimlarPage() {
  const teams = await getLiveTeams();
  const cardClassName =
    "pl-card scroll-mt-24 flex flex-col items-center gap-3 p-6 text-center transition-colors hover:border-accent";

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="Kuzey & Güney Ligi"
        title="Takımlar"
        description="Kadrosunu görmek istediğin takıma tıkla."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {teams.map((team) => {
          const content = (
            <>
              <TeamLogo teamId={team.id} name={team.name} size={56} />
              <span className="font-semibold">{team.name}</span>
            </>
          );

          if (team.id) {
            return (
              <Link
                key={team.name}
                href={`/takimlar/${team.id}`}
                id={slugify(team.name)}
                className={cardClassName}
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={team.name} id={slugify(team.name)} className={cardClassName}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
