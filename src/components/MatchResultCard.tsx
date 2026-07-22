import type { Match } from "@/data/league";

export default function MatchResultCard({ match }: { match: Match }) {
  const played = match.status === "played";
  return (
    <div className="pl-card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted">
        <span>
          {match.league} · {match.round}
        </span>
        <span>{match.date}</span>
      </div>
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <span className="flex-1 text-right text-sm font-semibold sm:text-lg">{match.home}</span>
        <span
          className={`shrink-0 rounded-lg px-3 py-1 text-lg font-extrabold sm:text-xl ${
            played ? "bg-surface-2 text-teal" : "bg-surface-2 text-muted"
          }`}
        >
          {played && match.homeScore !== null && match.awayScore !== null
            ? `${match.homeScore} - ${match.awayScore}`
            : match.time ?? "VS"}
        </span>
        <span className="flex-1 text-left text-sm font-semibold sm:text-lg">{match.away}</span>
      </div>
    </div>
  );
}
