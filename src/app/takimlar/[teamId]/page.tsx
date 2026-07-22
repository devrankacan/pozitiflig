import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TeamLogo from "@/components/TeamLogo";
import { getSquad, type SquadPlayer } from "@/lib/sofascore";

export const dynamic = "force-dynamic";

const POSITION_LABELS: Record<string, string> = {
  G: "Kaleci",
  D: "Defans",
  M: "Orta Saha",
  F: "Forvet",
};
const POSITION_ORDER = ["G", "D", "M", "F"];

function calcAge(timestampSeconds: number | null): number | null {
  if (!timestampSeconds) return null;
  const ageMs = Date.now() - timestampSeconds * 1000;
  const age = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
  return age > 0 && age < 100 ? age : null;
}

function jerseySort(a: SquadPlayer, b: SquadPlayer): number {
  const na = Number(a.jerseyNumber);
  const nb = Number(b.jerseyNumber);
  const va = Number.isFinite(na) ? na : 999;
  const vb = Number.isFinite(nb) ? nb : 999;
  return va - vb;
}

type PageParams = { params: Promise<{ teamId: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { teamId } = await params;
  const id = Number(teamId);
  const squad = Number.isFinite(id) ? await getSquad(id) : null;
  return {
    title: squad ? `${squad.teamName} Kadrosu | Pozitif Lig` : "Takım | Pozitif Lig",
    description: squad
      ? `${squad.teamName} kadrosu - Pozitif Lig`
      : "Pozitif Lig takım kadrosu.",
  };
}

export default async function TeamDetailPage({ params }: PageParams) {
  const { teamId } = await params;
  const id = Number(teamId);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const squad = await getSquad(id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <Link
        href="/takimlar"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
      >
        ← Takımlar
      </Link>

      <div className="mb-10 flex items-center gap-4">
        <TeamLogo teamId={id} name={squad?.teamName ?? "Takım"} size={64} />
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Kadro</span>
          <h1 className="text-2xl font-bold sm:text-3xl">{squad?.teamName ?? "Takım"}</h1>
        </div>
      </div>

      {!squad && (
        <div className="pl-card p-8 text-center">
          <p className="text-muted">
            Bu takımın kadro bilgisi şu anda alınamıyor. Lütfen daha sonra tekrar dene.
          </p>
        </div>
      )}

      {squad && (
        <div className="flex flex-col gap-8">
          {POSITION_ORDER.map((code) => {
            const players = squad.players.filter((p) => p.position === code).sort(jerseySort);
            if (players.length === 0) return null;
            return (
              <div key={code}>
                <h3 className="mb-3 text-lg font-bold text-accent">
                  {POSITION_LABELS[code] ?? code}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {players.map((p) => {
                    const age = calcAge(p.dateOfBirthTimestamp);
                    return (
                      <div key={p.id} className="pl-card flex items-center gap-3 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-bold text-accent">
                          {p.jerseyNumber || "-"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.name}</p>
                          {age && <p className="text-xs text-muted">{age} yaşında</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
