import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import StandingsWidget from "@/components/StandingsWidget";
import StandingsTable from "@/components/StandingsTable";
import MatchResultCard from "@/components/MatchResultCard";
import { standingsWidgets } from "@/data/league";
import type { Match, PlayoffMatch } from "@/data/league";
import {
  getKuzeyMatches,
  getGuneyMatchGroups,
  getKuzeyPlayoff,
  getGuneyPlayoff,
  getStandingsSections,
} from "@/lib/league-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Puan Durumu | Pozitif Lig",
  description: "Pozitif Lig Kuzey ve Güney Ligi güncel puan durumu ve maç sonuçları.",
};

function playoffToMatch(p: PlayoffMatch, league: string, idx: number): Match {
  return {
    id: `${league}-playoff-${idx}`,
    league,
    round: p.round,
    home: p.home,
    away: p.away,
    homeTeamId: p.homeTeamId,
    awayTeamId: p.awayTeamId,
    homeScore: p.homeScore,
    awayScore: p.awayScore,
    date: "Play-Off",
    status: "played",
  };
}

export default async function PuanDurumuPage() {
  const [kuzeyMatches, guneyGroups, kuzeyPlayoff, guneyPlayoff, standingsSections] =
    await Promise.all([
      getKuzeyMatches(),
      getGuneyMatchGroups(),
      getKuzeyPlayoff(),
      getGuneyPlayoff(),
      getStandingsSections(),
    ]);

  const groups: { title: string; matches: Match[] }[] = [
    { title: "Kuzey Ligi", matches: kuzeyMatches },
    { title: "Güney Ligi — Grup A", matches: guneyGroups.groupA },
    { title: "Güney Ligi — Grup B", matches: guneyGroups.groupB },
    { title: "Güney Ligi", matches: guneyGroups.ungrouped },
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
        title="Puan Durumu"
        description="Puan durumları Sofascore üzerinden anlık olarak güncellenir."
      />
      {standingsSections ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {standingsSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-lg font-bold text-accent">{section.title}</h3>
              <StandingsTable rows={section.rows} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {standingsWidgets.map((w) => (
            <StandingsWidget key={w.id} {...w} />
          ))}
        </div>
      )}

      <div className="mt-14">
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
    </div>
  );
}
