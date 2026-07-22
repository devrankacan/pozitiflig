import type { Match } from "@/data/league";
import TeamLogo from "@/components/TeamLogo";

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
        <span className="flex flex-1 items-center justify-end gap-2 text-right text-sm font-semibold sm:text-lg">
          <span className="truncate">{match.home}</span>
          <TeamLogo teamId={match.homeTeamId} name={match.home} size={28} />
        </span>
        <span
          className={`shrink-0 rounded-lg px-3 py-1 text-lg font-extrabold sm:text-xl ${
            played ? "bg-surface-2 text-accent" : "bg-surface-2 text-muted"
          }`}
        >
          {played && match.homeScore !== null && match.awayScore !== null
            ? `${match.homeScore} - ${match.awayScore}`
            : match.time ?? "VS"}
        </span>
        <span className="flex flex-1 items-center justify-start gap-2 text-left text-sm font-semibold sm:text-lg">
          <TeamLogo teamId={match.awayTeamId} name={match.away} size={28} />
          <span className="truncate">{match.away}</span>
        </span>
      </div>
    </div>
  );
}
