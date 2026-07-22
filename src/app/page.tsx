import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import StatLeaderList from "@/components/StatLeaderList";
import MatchResultCard from "@/components/MatchResultCard";
import TeamLogo from "@/components/TeamLogo";
import type { Match } from "@/data/league";
import {
  getGolKrallari,
  getAsistKrallari,
  getKuzeyPlayoff,
  getKuzeyMatches,
  getChampionsWithLogos,
} from "@/lib/league-data";

export const dynamic = "force-dynamic";

function PlayoffTeamLabel({ teamId, name }: { teamId?: number; name: string }) {
  const inner = (
    <>
      <TeamLogo teamId={teamId} name={name} size={20} />
      {name}
    </>
  );
  if (!teamId) {
    return <span className="inline-flex items-center gap-1.5">{inner}</span>;
  }
  return (
    <Link
      href={`/takimlar/${teamId}`}
      className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
    >
      {inner}
    </Link>
  );
}

export default async function Home() {
  const [golKrallari, asistKrallari, kuzeyPlayoff, kuzeyMatches, champions] = await Promise.all([
    getGolKrallari(),
    getAsistKrallari(),
    getKuzeyPlayoff(),
    getKuzeyMatches(),
    getChampionsWithLogos(),
  ]);

  const finalEntry = kuzeyPlayoff.find((p) => p.round === "Final");
  const featuredMatch: Match | null = finalEntry
    ? {
        id: "kuzey-final",
        league: "Kuzey Ligi",
        round: "Final",
        home: finalEntry.home,
        away: finalEntry.away,
        homeTeamId: finalEntry.homeTeamId,
        awayTeamId: finalEntry.awayTeamId,
        homeScore: finalEntry.homeScore,
        awayScore: finalEntry.awayScore,
        date: "Play-Off",
        status: "played",
      }
    : (kuzeyMatches[0] ?? null);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            2025/26 Sezonu
          </span>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            <span className="pl-gradient-text">Pozitif Lig</span>&apos;in nabzı burada atıyor
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
            Kuzey ve Güney Ligi puan durumları, maç sonuçları, gol/asist krallığı ve play-off
            takvimini tek yerden takip edin.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/puan-durumu"
              className="rounded-full bg-gradient-to-r from-accent to-accent-dark px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Puan Durumunu Gör
            </Link>
            <Link
              href="/mac-sonuclari"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface-2"
            >
              Maç Sonuçları
            </Link>
          </div>
        </div>
      </section>

      {/* Şampiyonlar */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="2025/26 Sezonu" title="Şampiyonlar" />
        <div className="grid gap-4 sm:grid-cols-3">
          {champions.map((c) => (
            <div key={c.team} className="pl-card p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-2">
                {c.league} Şampiyonu
              </span>
              {c.teamId ? (
                <Link
                  href={`/takimlar/${c.teamId}`}
                  className="mt-2 flex items-center gap-3 transition-colors hover:text-accent"
                >
                  <TeamLogo teamId={c.teamId} name={c.team} size={36} />
                  <h3 className="text-xl font-bold">{c.team}</h3>
                </Link>
              ) : (
                <div className="mt-2 flex items-center gap-3">
                  <TeamLogo teamId={c.teamId} name={c.team} size={36} />
                  <h3 className="text-xl font-bold">{c.team}</h3>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span className="text-lg font-extrabold text-foreground">{c.score}</span>
                <span>{c.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Öne çıkan maç */}
      {featuredMatch && (
        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <SectionHeading eyebrow="Öne Çıkan" title="Kuzey Ligi Finali" />
          <MatchResultCard match={featuredMatch} />
        </section>
      )}

      {/* İstatistik Krallıkları */}
      <section id="istatistikler" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <SectionHeading eyebrow="Kuzey Ligi" title="Gol ve Asist Krallığı" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div id="gol-krallik" className="scroll-mt-24">
            <StatLeaderList title="Gol Krallığı" unit="gol" leaders={golKrallari} accent="secondary" />
          </div>
          <div id="asist-krallik" className="scroll-mt-24">
            <StatLeaderList title="Asist Krallığı" unit="asist" leaders={asistKrallari} accent="primary" />
          </div>
        </div>
      </section>

      {/* Play-off */}
      {kuzeyPlayoff.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <SectionHeading eyebrow="Kuzey Ligi" title="Play-Off Takvimi" />
          <div className="pl-card p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {kuzeyPlayoff.map((p, idx) => {
                const isFinal = p.round === "Final";
                return (
                  <div key={`${p.round}-${idx}`}>
                    <span
                      className={`text-xs font-semibold uppercase tracking-widest ${
                        isFinal ? "text-accent-2" : "text-muted"
                      }`}
                    >
                      {p.round}
                    </span>
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                      <PlayoffTeamLabel teamId={p.homeTeamId} name={p.home} />
                      <span className={isFinal ? "text-accent-2" : "text-accent"}>
                        {p.homeScore}-{p.awayScore}
                      </span>
                      <PlayoffTeamLabel teamId={p.awayTeamId} name={p.away} />
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
