import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TeamLogo from "@/components/TeamLogo";
import SquadGrid from "@/components/SquadGrid";
import { getSquad } from "@/lib/sofascore";

export const dynamic = "force-dynamic";

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

      {squad && <SquadGrid players={squad.players} teamName={squad.teamName} />}
    </div>
  );
}
