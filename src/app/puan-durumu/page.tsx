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
  type StandingsSection,
} from "@/lib/league-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Puan Durumu | Pozitif Lig",
  description: "Pozitif Lig Kuzey ve Güney Ligi güncel puan durumu ve maç sonuçları.",
};

const COLUMN_TITLES: Record<"kuzey" | "guney-a" | "guney-b", string> = {
  kuzey: "Kuzey Ligi",
  "guney-a": "Güney Ligi — Grup A",
  "guney-b": "Güney Ligi — Grup B",
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

function StandingsColumn({
  columnKey,
  standingsSections,
  matches,
}: {
  columnKey: "kuzey" | "guney-a" | "guney-b";
  standingsSections: StandingsSection[] | null;
  matches: Match[];
}) {
  const nativeSection = standingsSections?.find((s) => s.group === columnKey);
  const widget = standingsWidgets.find((w) => w.group === columnKey);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-lg font-bold text-accent">{COLUMN_TITLES[columnKey]}</h3>
        {nativeSection ? <StandingsTable rows={nativeSection.rows} /> : widget ? <StandingsWidget {...widget} /> : null}
      </div>

      {matches.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Maç Sonuçları
          </h4>
          <div className="flex flex-col gap-4">
            {matches.map((m) => (
              <MatchResultCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

  const kuzeyPlayoffMatches = kuzeyPlayoff.map((p, idx) =>
    playoffToMatch(p, "Kuzey Ligi Play-Off", idx),
  );
  const guneyPlayoffMatches = (guneyPlayoff ?? []).map((p, idx) =>
    playoffToMatch(p, "Güney Ligi Play-Off", idx),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="2025/26 Sezonu"
        title="Puan Durumu"
        description="Puan durumları ve maç sonuçları Sofascore üzerinden anlık olarak güncellenir."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <StandingsColumn
          columnKey="kuzey"
          standingsSections={standingsSections}
          matches={[...kuzeyMatches, ...kuzeyPlayoffMatches]}
        />
        <StandingsColumn
          columnKey="guney-a"
          standingsSections={standingsSections}
          matches={guneyGroups.groupA}
        />
        <StandingsColumn
          columnKey="guney-b"
          standingsSections={standingsSections}
          matches={guneyGroups.groupB}
        />
      </div>

      {guneyPlayoffMatches.length > 0 && (
        <div className="mt-12">
          <h3 className="mb-4 text-lg font-bold text-accent">Güney Ligi Play-Off</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guneyPlayoffMatches.map((m) => (
              <MatchResultCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}

      {guneyGroups.ungrouped.length > 0 && (
        <div className="mt-12">
          <h3 className="mb-4 text-lg font-bold text-accent">Güney Ligi</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guneyGroups.ungrouped.map((m) => (
              <MatchResultCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
