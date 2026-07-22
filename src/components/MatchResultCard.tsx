import Link from "next/link";
import type { Match } from "@/data/league";
import TeamLogo from "@/components/TeamLogo";

function TeamLabel({
  teamId,
  name,
  align,
}: {
  teamId?: number;
  name: string;
  align: "right" | "left";
}) {
  const className = `flex flex-1 items-center gap-2 text-sm font-semibold sm:text-lg ${
    align === "right" ? "justify-end text-right" : "justify-start text-left"
  }`;
  const nameSpan = <span className="truncate">{name}</span>;
  const logo = <TeamLogo teamId={teamId} name={name} size={28} />;
  const inner = align === "right" ? [nameSpan, logo] : [logo, nameSpan];

  if (!teamId) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <Link href={`/takimlar/${teamId}`} className={`${className} transition-colors hover:text-accent`}>
      {inner}
    </Link>
  );
}

export default function MatchResultCard({ match }: { match: Match }) {
  const played = match.status === "played";
  return (
    <div id={match.id} className="pl-card scroll-mt-24 flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted">
        <span>
          {match.league} · {match.round}
        </span>
        <span>{match.date}</span>
      </div>
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <TeamLabel teamId={match.homeTeamId} name={match.home} align="right" />
        <span
          className={`shrink-0 rounded-lg px-3 py-1 text-lg font-extrabold sm:text-xl ${
            played ? "bg-surface-2 text-accent" : "bg-surface-2 text-muted"
          }`}
        >
          {played && match.homeScore !== null && match.awayScore !== null
            ? `${match.homeScore} - ${match.awayScore}`
            : match.time ?? "VS"}
        </span>
        <TeamLabel teamId={match.awayTeamId} name={match.away} align="left" />
      </div>
    </div>
  );
}
