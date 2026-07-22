import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import StatLeaderList from "@/components/StatLeaderList";
import MatchResultCard from "@/components/MatchResultCard";
import { champions, golKrallari, asistKrallari, kuzeyPlayoff, matches } from "@/data/league";

export default function Home() {
  const finalMatch = matches.find((m) => m.id === "kuzey-final");

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
              <h3 className="mt-2 text-xl font-bold">{c.team}</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span className="text-lg font-extrabold text-foreground">{c.score}</span>
                <span>{c.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final maçı öne çıkan */}
      {finalMatch && (
        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <SectionHeading eyebrow="Öne Çıkan" title="Kuzey Ligi Finali" />
          <MatchResultCard match={finalMatch} />
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
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <SectionHeading eyebrow="Kuzey Ligi" title="Play-Off Takvimi" />
        <div className="pl-card p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                Yarı Final
              </span>
              <p className="mt-2 font-semibold">
                {kuzeyPlayoff[0].home}{" "}
                <span className="text-accent">
                  {kuzeyPlayoff[0].homeScore}-{kuzeyPlayoff[0].awayScore}
                </span>{" "}
                {kuzeyPlayoff[0].away}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                Yarı Final
              </span>
              <p className="mt-2 font-semibold">
                {kuzeyPlayoff[1].home}{" "}
                <span className="text-accent">
                  {kuzeyPlayoff[1].homeScore}-{kuzeyPlayoff[1].awayScore}
                </span>{" "}
                {kuzeyPlayoff[1].away}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-2">
                Final
              </span>
              <p className="mt-2 font-semibold">
                {kuzeyPlayoff[2].home}{" "}
                <span className="text-accent-2">
                  {kuzeyPlayoff[2].homeScore}-{kuzeyPlayoff[2].awayScore}
                </span>{" "}
                {kuzeyPlayoff[2].away}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
