import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import MatchResultCard from "@/components/MatchResultCard";
import type { Match, PlayoffMatch } from "@/data/league";
import { getKuzeyMatches, getGuneyMatches, getKuzeyPlayoff, getGuneyPlayoff } from "@/lib/league-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maç Sonuçları | Pozitif Lig",
  description: "Pozitif Lig Kuzey ve Güney Ligi maç sonuçları ve fikstür.",
};

function playoffToMatch(p: PlayoffMatch, league: string, idx: number): Match {
  return {
    id: `${league}-playoff-${idx}`,
    league,
    round: p.round,
    home: p.home,
    away: p.away,
    homeScore: p.homeScore,
    awayScore: p.awayScore,
    date: "Play-Off",
    status: "played",
  };
}

export default async function MacSonuclariPage() {
  const [kuzeyMatches, guneyMatches, kuzeyPlayoff, guneyPlayoff] = await Promise.all([
    getKuzeyMatches(),
    getGuneyMatches(),
    getKuzeyPlayoff(),
    getGuneyPlayoff(),
  ]);

  const groups: { title: string; matches: Match[] }[] = [
    { title: "Kuzey Ligi", matches: kuzeyMatches },
    { title: "Güney Ligi", matches: guneyMatches },
    {
      title: "Kuzey Ligi Play-Off",
      matches: kuzeyPlayoff.map((p, idx) => playoffToMatch(p, "Kuzey Ligi Play-Off", idx)),
    },
  ];

  if (guneyPlayoff && guneyPlayoff.length > 0) {
    groups.push({
      title: "Güney Ligi Play-Off",
      matches: guneyPlayoff.map((p, idx) => playoffToMatch(p, "Güney Ligi Play-Off", idx)),
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="2025/26 Sezonu"
        title="Maç Sonuçları"
        description="Lig aşaması ve play-off sonuçları Sofascore üzerinden canlı olarak güncellenir."
      />
      <div className="flex flex-col gap-10">
        {groups
          .filter((g) => g.matches.length > 0)
          .map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-lg font-bold text-accent">{group.title}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.matches.map((m) => (
                  <MatchResultCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
